import * as XLSX from 'xlsx';
import fs from 'fs';

// 1. Generate Meter Readings
const readings = [
    {
        Code: "M001",
        Branch: "B001",
        Installation: "INST001",
        Compteur: "C123456",
        Name: "John Doe",
        "Inx-Dep": "1000",
        Usage: "Residential",
        SEQ: "1"
    },
    {
        Code: "M002",
        Branch: "B001",
        Installation: "INST002",
        Compteur: "C789012",
        Name: "Jane Smith",
        "Inx-Dep": "2500",
        Usage: "Commercial",
        SEQ: "2"
    }
];

const wsReadings = XLSX.utils.json_to_sheet(readings);
const wbReadings = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbReadings, wsReadings, "Readings");
XLSX.writeFile(wbReadings, "test_readings.xlsx");
console.log("Created test_readings.xlsx");

// 2. Generate Bills
// Expected Order: Code, Branch, Installation, Name, BillLBP, BillUSD
const bills = [
    ["Code", "Branch", "Installation", "Name", "BillLBP", "BillUSD"],
    ["B001", "BR001", "INST001", "John Doe", 150000, 10.50],
    ["B002", "BR001", "INST002", "Jane Smith", 300000, 21.00]
];

const wsBills = XLSX.utils.aoa_to_sheet(bills);
const wbBills = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbBills, wsBills, "Bills");
XLSX.writeFile(wbBills, "test_bills.xlsx");
console.log("Created test_bills.xlsx");
