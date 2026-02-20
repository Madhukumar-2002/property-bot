const ExcelJS = require("exceljs");

app.get("/export-excel", async (req, res) => {
  const users = await User.find({});

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = [
    { header: "Phone", key: "phone" },
    { header: "Intent", key: "intent" },
    { header: "Budget", key: "budget" },
    { header: "Location", key: "location" }
  ];

  users.forEach(u => sheet.addRow(u));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});
