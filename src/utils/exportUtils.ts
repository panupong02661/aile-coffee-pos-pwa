import * as XLSX from 'xlsx';

// Export to Excel
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-width columns
  const colWidths = data.length > 0 
    ? Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
      }))
    : [];
  worksheet['!cols'] = colWidths;
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Export to PDF (using print-friendly HTML)
export const exportToPDF = (
  title: string,
  headers: string[],
  rows: string[][],
  fileName: string,
  summary?: { label: string; value: string }[]
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('กรุณาอนุญาตให้เปิด popup เพื่อดาวน์โหลด PDF');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { 
          font-family: 'Sarabun', 'Noto Sans Thai', sans-serif; 
          padding: 20px;
          font-size: 12px;
        }
        h1 { 
          text-align: center; 
          color: #333;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .meta {
          text-align: center;
          color: #666;
          margin-bottom: 20px;
          font-size: 11px;
        }
        .summary {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .summary-item {
          text-align: center;
          padding: 10px 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .summary-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .summary-label {
          font-size: 10px;
          color: #666;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
          font-size: 11px;
        }
        th { 
          background-color: #4a3728; 
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f5f5f5; }
        .no-print { display: none; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</div>
      
      ${summary ? `
        <div class="summary">
          ${summary.map(item => `
            <div class="summary-item">
              <div class="summary-value">${item.value}</div>
              <div class="summary-label">${item.label}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// Helper to format member data for export
export const formatMemberDataForExport = (members: any[]) => {
  return members.map((member, index) => ({
    'ลำดับ': index + 1,
    'ชื่อ': member.name,
    'เบอร์โทร': member.phone,
    'อีเมล': member.email || '-',
    'ระดับ': getTierNameThai(member.tier),
    'แต้มสะสม': member.points?.toLocaleString() || 0,
    'ยอดซื้อรวม (บาท)': member.total_spent?.toLocaleString() || 0,
    'วันที่เข้าร่วม': member.join_date ? new Date(member.join_date).toLocaleDateString('th-TH') : '-'
  }));
};

// Helper to format dashboard data for export
export const formatDashboardDataForExport = (members: any[]) => {
  const silverMembers = members.filter(m => m.tier === 'silver');
  const goldMembers = members.filter(m => m.tier === 'gold');
  const platinumMembers = members.filter(m => m.tier === 'platinum');

  const summaryData = [
    { 'หมวด': 'สรุปภาพรวม', 'รายละเอียด': '', 'จำนวน': '', 'แต้มรวม': '' },
    { 'หมวด': '', 'รายละเอียด': 'สมาชิกทั้งหมด', 'จำนวน': members.length, 'แต้มรวม': members.reduce((sum, m) => sum + m.points, 0).toLocaleString() },
    { 'หมวด': '', 'รายละเอียด': 'สมาชิกระดับเงิน', 'จำนวน': silverMembers.length, 'แต้มรวม': silverMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString() },
    { 'หมวด': '', 'รายละเอียด': 'สมาชิกระดับทอง', 'จำนวน': goldMembers.length, 'แต้มรวม': goldMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString() },
    { 'หมวด': '', 'รายละเอียด': 'สมาชิกระดับแพลตินัม', 'จำนวน': platinumMembers.length, 'แต้มรวม': platinumMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString() },
    { 'หมวด': '', 'รายละเอียด': '', 'จำนวน': '', 'แต้มรวม': '' },
    { 'หมวด': 'TOP 5 สมาชิกเงิน', 'รายละเอียด': '', 'จำนวน': '', 'แต้มรวม': '' },
    ...getTop5(silverMembers),
    { 'หมวด': '', 'รายละเอียด': '', 'จำนวน': '', 'แต้มรวม': '' },
    { 'หมวด': 'TOP 5 สมาชิกทอง', 'รายละเอียด': '', 'จำนวน': '', 'แต้มรวม': '' },
    ...getTop5(goldMembers),
    { 'หมวด': '', 'รายละเอียด': '', 'จำนวน': '', 'แต้มรวม': '' },
    { 'หมวด': 'TOP 5 สมาชิกแพลตินัม', 'รายละเอียด': '', 'จำนวน': '', 'แต้มรวม': '' },
    ...getTop5(platinumMembers),
  ];

  return summaryData;
};

const getTop5 = (members: any[]) => {
  return members
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((m, i) => ({
      'หมวด': '',
      'รายละเอียด': `${i + 1}. ${m.name} (${m.phone})`,
      'จำนวน': '',
      'แต้มรวม': m.points.toLocaleString()
    }));
};

const getTierNameThai = (tier: string) => {
  switch (tier) {
    case 'platinum': return 'แพลตินัม';
    case 'gold': return 'ทอง';
    case 'silver': return 'เงิน';
    default: return tier;
  }
};
