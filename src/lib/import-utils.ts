import Papa from "papaparse";
import * as XLSX from "xlsx";
import { extractTextFromPdf } from "./pdf-utils";
import { Transaction } from "./types";

/**
 * Intelligent field mapping for standard transaction exports
 */
const DATE_FIELDS = ['date', 'transaction date', 'txn date', 'value date', 'tran date', 'txn. date', 'transaction dttm'];
const DESC_FIELDS = ['description', 'narration', 'particulars', 'remarks', 'trans details', 'details', 'activity', 'transaction details'];
const AMOUNT_FIELDS = ['amount', 'transaction amount', 'txn amount', 'value', 'withdrawal', 'deposit', 'withdrawal amt.', 'deposit amt.', 'debit', 'credit', 'dr', 'cr'];
const CATEGORY_FIELDS = ['category', 'type', 'head'];

/**
 * Fuzzy header mapping that ignores special characters and casing
 */
function fuzzyMatch(key: string, fieldList: string[]): boolean {
    const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    return fieldList.some(field => {
        const sanitizedField = field.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        return sanitizedKey === sanitizedField;
    });
}

/**
 * Intelligent category detection based on bank narration patterns
 */
function suggestCategory(description: string, type: 'income' | 'expense'): string {
    const desc = description.toLowerCase();
    
    // Income Patterns
    if (type === 'income') {
        if (desc.includes('salary') || desc.includes('hike') || desc.includes('bonus')) return "Salary";
        if (desc.includes('interest') || desc.includes('intt')) return "Interest";
        if (desc.includes('dividend')) return "Investment";
        if (desc.includes('refund') || desc.includes('reversal')) return "Refund";
        return "Income";
    }

    // Expense Patterns
    if (desc.includes('emi') || desc.includes('loan') || desc.includes('finance')) return "Loan/EMI";
    if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('restaurant') || desc.includes('cafe') || desc.includes('pizza') || desc.includes('food') || desc.includes('parlour') || desc.includes('sweets') || desc.includes('hotel')) return "Food & Dining";
    if (desc.includes('petrol') || desc.includes('diesel') || desc.includes('fuel') || desc.includes('uber') || desc.includes('ola') || desc.includes('rapido') || desc.includes('taxi') || desc.includes('iocl') || desc.includes('bpcl') || desc.includes('hpcl') || desc.includes('petr')) return "Transportation";
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') || desc.includes('ajio') || desc.includes('shopping') || desc.includes('mart') || desc.includes('store') || desc.includes('kirana')) return "Shopping";
    if (desc.includes('netflix') || desc.includes('hotstar') || desc.includes('spotify') || desc.includes('movie') || desc.includes('inox') || desc.includes('pvr')) return "Entertainment";
    if (desc.includes('recharge') || desc.includes('jio') || desc.includes('airtel') || desc.includes('vi') || desc.includes('electricity') || desc.includes('bill') || desc.includes('rent')) return "Rent & Utilities";
    if (desc.includes('insurance') || desc.includes('premium')) return "Insurance";
    if (desc.includes('hospital') || desc.includes('pharmacy') || desc.includes('medical') || desc.includes('doctor')) return "Health";
    if (desc.includes('atm') || desc.includes('cash')) return "Cash Withdrawal";
    if (desc.includes('upi') || desc.includes('transfer') || desc.includes('neft') || desc.includes('rtgs') || desc.includes('vpa') || desc.includes('charges') || desc.includes('gst') || desc.includes('tax')) return "Miscellaneous";

    return "Uncategorized";
}

/**
 * Parses a CSV or Excel file and returns an array of transaction-like objects
 */
export async function parseFile(file: File): Promise<any[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        const text = await file.text();
        const results = Papa.parse(text, { header: true, skipEmptyLines: true });
        return mapToTransactions(results.data);
    } else if (extension === 'xls' || extension === 'xlsx') {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to raw array of arrays to find the real header row
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Hunt for the header row (contains "date" and "narration" or "description")
        let headerIndex = -1;
        for (let i = 0; i < Math.min(rawRows.length, 50); i++) {
            const row = rawRows[i];
            if (!row) continue;
            const rowStr = row.join(' ').toLowerCase();
            if ((rowStr.includes('date') || rowStr.includes('txn date')) && (rowStr.includes('narration') || rowStr.includes('description') || rowStr.includes('particulars') || rowStr.includes('activity'))) {
                headerIndex = i;
                break;
            }
        }

        // Re-parse from the correct header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerIndex === -1 ? 0 : headerIndex });
        return mapToTransactions(jsonData);
    } else if (extension === 'pdf') {
        const fullText = await extractTextFromPdf(file);
        return parsePdfTransactions(fullText);
    }

    throw new Error("Unsupported file format. Please upload CSV, XLS, XLSX, or PDF.");
}

/**
 * Maps arbitrary JSON data from file to MoneyFlow transaction structure
 */
export function mapToTransactions(data: any[]): any[] {
    const transactions: any[] = [];
    
    for (const row of data) {
        // Skip rows that look like separators (e.g., ".......") or are empty
        const rowValues = Object.values(row).join(' ');
        if (rowValues.includes('.......') || rowValues.trim() === '') continue;

        // STOP parsing if we hit a summary/footer row
        const rowValuesLower = rowValues.toLowerCase();
        if (rowValuesLower.includes('summary') || 
            rowValuesLower.includes('opening balance') ||
            rowValuesLower.includes('closing bal') ||
            rowValuesLower.includes('count') ||
            rowValuesLower.includes('total') ||
            rowValuesLower.includes('*****')
        ) {
            // If we've already found some transactions, this is definitely the footer
            if (transactions.length > 0) break;
            continue;
        }

        const keys = Object.keys(row);
        const normalizedKeyMap: any = {};
        for (const key of keys) {
            const sanitized = key.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
            normalizedKeyMap[sanitized] = row[key];
        }

        // Find matches for core fields using fuzzy logic
        const dateKey = keys.find(k => fuzzyMatch(k, DATE_FIELDS));
        const descKey = keys.find(k => fuzzyMatch(k, DESC_FIELDS));
        const categoryKey = keys.find(k => fuzzyMatch(k, CATEGORY_FIELDS));

        // Enhanced amount detection: Check split columns first
        let amount = 0;
        let type: 'income' | 'expense' = 'expense';

        const withdrawal = parseFloat(String(normalizedKeyMap['withdrawal'] || normalizedKeyMap['withdrawalamt'] || normalizedKeyMap['debit'] || normalizedKeyMap['dr'] || "0").replace(/,/g, '').trim()) || 0;
        const deposit = parseFloat(String(normalizedKeyMap['deposit'] || normalizedKeyMap['depositamt'] || normalizedKeyMap['credit'] || normalizedKeyMap['cr'] || "0").replace(/,/g, '').trim()) || 0;

        if (withdrawal !== 0 || deposit !== 0) {
            // Priority 1: Split columns (Axis, HDFC etc.)
            amount = withdrawal !== 0 ? -Math.abs(withdrawal) : Math.abs(deposit);
            type = amount < 0 ? 'expense' : 'income';
        } else {
            // Priority 2: Consolidated column
            const amountKey = keys.find(k => fuzzyMatch(k, AMOUNT_FIELDS));
            if (amountKey) {
                const rawAmount = String(row[amountKey as string]).replace(/,/g, '').trim();
                amount = parseFloat(rawAmount) || 0;
                type = amount < 0 ? 'expense' : 'income';
            }
        }

        // If amount is still 0, it might be a header or empty row
        if (amount === 0) continue;

        // Final amount should be positive for storage
        amount = Math.abs(amount);

        // Standardize type detection based on deposit/credit indicators
        const typeStr = String(normalizedKeyMap['type'] || "").toLowerCase();
        if (typeStr.includes('income') || deposit !== 0) {
            type = 'income';
        } else if (typeStr.includes('expense') || typeStr.includes('debit') || withdrawal !== 0) {
            type = 'expense';
        }

        // Standardize Date (attempt to parse various formats, prioritizing DD/MM/YY for banks)
        let date = "";
        let dateValid = false;
        if (dateKey) {
            const rawDate = String(row[dateKey as string]);
            // Try DD/MM/YY or DD/MM/YYYY
            const dmyMatch = rawDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
            if (dmyMatch) {
                let [_, d, m, y] = dmyMatch;
                if (y.length === 2) y = "20" + y; // Assume 20xx
                date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                dateValid = true;
            } else {
                const parsedDate = new Date(rawDate);
                if (!isNaN(parsedDate.getTime())) {
                    date = parsedDate.toISOString().split('T')[0];
                    dateValid = true;
                }
            }
        }

        // If we can't find a valid date in DD/MM/YY or DD/MM/YYYY format, it's garbage (like summary headers)
        if (!dateValid) continue;

        const description = descKey ? String(row[descKey as string]).trim() : "";
        const descriptionLower = description.toLowerCase();

        // Skip rows that are clearly summarized descriptions
        if (!description || 
            descriptionLower === 'opening balance' || 
            descriptionLower === 'closing bal' || 
            descriptionLower === 'statement summary' ||
            descriptionLower.includes('summary to date')
        ) {
            continue;
        }

        let category = categoryKey ? row[categoryKey as string] : null;
        if (!category || (typeof category === 'string' && (category.toLowerCase() === 'uncategorized' || category.toLowerCase() === 'income'))) {
            category = suggestCategory(description, type);
        }

        transactions.push({
            description: description.substring(0, 500),
            amount,
            date,
            type: (typeof category === 'string' && category.toLowerCase() === 'income') ? 'income' : type,
            category,
            paymentMethod: "bank", // Default for imports
        });
    }

    return transactions;
}
/**
 * Specialized parser for extracted PDF text (targeting Slice format)
 */
function parsePdfTransactions(text: string): any[] {
  const transactions: any[] = [];
  const lines = text.split('\n');
  
  // Date format: 21 Mar '26 or 21 Mar 2026
  const dateRegex = /(\d{1,2})\s+([A-Za-z]{3})\s+'?(\d{2,4})/;
  // Amount regex: Looking for ₹ or whitespace followed by digits (allowing for potential spaces)
  // Standardizing on capturing the first number group after ₹
  const amountRegex = /[₹]\s*?([\d,]+(?:\.\d{1,2})?)/g;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;

    const [fullDateMatch, day, monthStr, year] = dateMatch;
    
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const month = months[monthStr];
    if (!month) continue;

    const fullYear = year.length === 2 ? `20${year}` : year;
    const date = `${fullYear}-${month}-${day.padStart(2, '0')}`;
    
    // Extract everything after the date to search for amounts
    const afterDate = line.split(fullDateMatch)[1] || "";
    const amountMatches = [...afterDate.matchAll(amountRegex)];
    
    if (amountMatches.length === 0) continue;

    const amountStr = amountMatches[0][1].replace(/,/g, '');
    const amount = parseFloat(amountStr) || 0;
    
    if (amount === 0) continue;

    // Description is the text between the date and the first amount symbol
    const description = afterDate.split('₹')[0].trim() || "Bank Transaction";
    
    let type: 'income' | 'expense' = 'expense';
    const lowerDesc = description.toLowerCase();
    
    // Slice specific markers for income
    if (lowerDesc.includes('credit') || 
        lowerDesc.includes('interest cr') || 
        lowerDesc.includes('refund') ||
        lowerDesc.includes('cashback') ||
        lowerDesc.includes('monies transfer')
    ) {
      type = 'income';
    }

    const category = suggestCategory(description, type);

    transactions.push({
      date,
      description: description.substring(0, 500),
      amount,
      type: (category === 'Income' || category === 'Interest') ? 'income' : type,
      category,
      paymentMethod: "bank"
    });
  }

  return transactions;
}
