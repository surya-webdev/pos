const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const express = require("express");
const app = express();
const cors = require("cors");

const PORT = 4000;

app.use(cors());
app.use(express.json());

// let printer;

// async function initPrinter() {
//   printer = new ThermalPrinter({
//     type: PrinterTypes.EPSON, // Change this if you're using a different printer type
//     interface: "//localhost/POS-80-Series1", // Updated path format
//     options: {
//       timeout: 1000,
//     },
//   });

//   try {
//     const isConnected = await printer.isPrinterConnected();
//     console.log("Printer connected:", isConnected);
//   } catch (error) {
//     console.error("Printer connection error:", error);
//   }
// }

// initPrinter();

let printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: "//localhost/POS-80-Series1",
  options: {
    timeout: 1000,
  },
});

printer.alignCenter();
printer.setTextSize(2, 2);
// // printer.
// printer.println("Sabarinath.S");

// // printer.println("");
// printer.cut();
// try {
//   let execute = printer.execute();
//   console.log("Print done!");
// } catch (error) {
//   console.error("Print failed:", error);
// }

app.get("/", async (req, res) => {
  try {
    printer.println("get");
    printer.cut();
    await printer.execute();

    res.json({
      message: "Print",
    });
  } catch (error) {
    console.error("Print failed:", error);
    res.json({ message: "failed" });
  }
});

app.post("/print", async (req, res) => {
  console.log(req.body);
  const { title } = req.body;
  console.log(title);
  try {
    printer.alignCenter();
    printer.println(title);
    printer.cut();

    await printer.execute();

    return res.json({ message: "SUCESSS" });
  } catch (error) {
    console.error("errorMessage", error);
    res.status(501);
  }
});

app.listen(PORT, () => {
  console.log(PORT);
});
