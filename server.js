const express = require("express");
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const usb = require('usb');
const { getDeviceList } = require('usb');
// import { getDeviceList } from 'usb';
let count = 0;
let orderSafe = 137;

const PRINTER_VENDOR_ID = 10927; //  vendor ID
const PRINTER_PRODUCT_ID = 24580; // productid

function isPrinterConnected() {
  const devices = usb.getDeviceList();

  try {
    for (let device of devices) {
      if (device.deviceDescriptor.idVendor === PRINTER_VENDOR_ID && device.deviceDescriptor.idProduct === PRINTER_PRODUCT_ID) {
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking printer connection:', error);
  }
  return false;
}


const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  width: 48,
  removeSpecialCharacters: false,
  // interface: "win32",
  // interface: "PRINTENUM/LocalPrintQueue",
  interface: "//localhost/POS-80-Series1",
  lineCharacter: "2", // Set character for lines - default: "-"
  // breakLine: BreakLine.WORD, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
  options: {
    timeout: 5000,
  },
});

const rupees = "Rs.";


app.use("/", async(req,res ,next)=>{
  count++;
  orderSafe++;
  console.log("COUNT IS " + count);
if (isPrinterConnected()) {
  next();
}else{
  return res.status(511).json({ status:"failed",message:"Printer is not connected"})
  }
})


app.post("/print", async (req, res) => {

  await printer.clear(); 

  const { items, totalPrice ,order , orderType , payStatus , payMode} = await req.body;

  if (items.length === 0 || !totalPrice) return;

  const orders = (order < 9 ? `0${order}`:order) || orderSafe;

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const hour = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();


    try {
    printer.setTypeFontB();
    printer.alignRight();
    printer.setTextNormal();
    printer.bold(true);
    printer.println(`Order No : ${orders}`)
    printer.println(formattedDate);
    printer.println(
      `${hour}:${minutes < 9 ? "0" + minutes : minutes}:${
        seconds < 9 ? "0" + seconds : seconds
      }`
    );
    printer.newLine();
    printer.newLine();
    //
    printer.getWidth();
    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();
    printer.setTextQuadArea();
    printer.alignCenter();
    printer.bold(true);
    printer.println("Murugan Hotel");
    // Draws a line
    printer.newLine();
    printer.newLine();

    printer.setTextNormal();
    printer.tableCustom([
      { text: "Food", align: "LEFT" },
      { text: "Quantity", align: "CENTER", bold: true },
      { text: "Price", align: "RIGHT" },
    ]);
    printer.newLine();

    {
      items.map((item) => {
        return (
          printer.tableCustom([
            { text: item.name, align: "LEFT", bold: true },
            {
              text: String(item.quantity ? item.quantity : "1"),
              align: "CENTER",
              bold: true,
            },
            {
              text: String(`${rupees}${(item.price )* (item.quantity ? item.quantity : 1)}`),
              align: "RIGHT",
            },
          ]),
          printer.newLine()
        );
      });
    }
    printer.underline(true);
    printer.drawLine("-");
    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();

    printer.setTextQuadArea();
    printer.alignRight();
    printer.bold(true);
    printer.println("TOTAL");
    printer.newLine();
    printer.println(`${rupees}${totalPrice}`);
    printer.newLine();

    printer.alignLeft();
    printer.setTextNormal();
    printer.bold(true);
    printer.println(`Order Type : ${orderType}`)
    printer.println(`Payment : ${payStatus}`)
    printer.println(`Mode : ${payMode}`)
    printer.newLine();
    printer.newLine();

    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();
    printer.alignCenter();
    printer.bold(true);
    printer.println("Thanks For Coming.");
    printer.println("Please Visit Again!");
    printer.newLine();
    printer.printQR("https://linktr.ee/foodieshub.blr");
    printer.partialCut();


    printer.setTypeFontB();
    printer.bold(true);
    printer.alignCenter();

    printer.println("KITCHEN ORDER");
    printer.alignRight();
    printer.bold(true);
    printer.println(`Ord No : ${orders}`)
    printer.println(formattedDate);
    printer.println(
      `${hour}:${minutes < 9 ? "0" + minutes : minutes}:${
        seconds < 9 ? "0" + seconds : seconds
      }`
    );
    printer.setTextNormal();
    printer.tableCustom([
      { text: "Food Item", align: "LEFT", bold: true },
      { text: "Quantity", align: "RIGHT", bold: true },
    ]);
    printer.newLine();

    {
      items.map((item) => {
        return (
          printer.tableCustom([
            { text: item.name, align: "LEFT", bold: true },
            {
              text: String(item.quantity ? item.quantity : "1"),
              align: "RIGHT",
              bold: true,
            },
          ]),
          printer.drawLine("-")
        );
      });
    }

    printer.newLine();
    
    printer.alignLeft();
    printer.setTextNormal();
    printer.bold(true);
    printer.println(`Order Type : ${orderType}`)
    printer.println(`Payment : ${payStatus}`)
    printer.println(`Mode : ${payMode}`)
  
    printer.newLine();
    
    printer.cut();

    await printer.execute();

    return res.json({
      message: "success",
    });

  } 
  catch (error) {
    console.error("error", error);
    return res.json({
      message: "failed",
      error: "PRINTER EXCUTION PROBLEM",
    });
  }
  
});


app.post("/printorder", async (req, res) => {

  await printer.clear(); 

  const { items, totalPrice ,order , orderType , payStatus , payMode} = await req.body;

  if (items.length === 0 || !totalPrice) return;

  const orders = (order < 9 ? `0${order}`:order) || orderSafe;

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const hour = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();


    try {
    printer.setTypeFontB();
    printer.alignRight();
    printer.setTextNormal();
    printer.bold(true);
    printer.println(`Order No : ${orders}`)
    printer.println(formattedDate);
    printer.println(
      `${hour}:${minutes < 9 ? "0" + minutes : minutes}:${
        seconds < 9 ? "0" + seconds : seconds
      }`
    );
    printer.newLine();
    printer.newLine();
    //
    printer.getWidth();
    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();
    printer.setTextQuadArea();
    printer.alignCenter();
    printer.bold(true);
    printer.println("Murugan Hotel");
    // Draws a line
    printer.newLine();
    printer.newLine();

    printer.setTextNormal();
    printer.tableCustom([
      { text: "Food", align: "LEFT" },
      { text: "Quantity", align: "CENTER", bold: true },
      { text: "Price", align: "RIGHT" },
    ]);
    printer.newLine();

    {
      items.map((item) => {
        return (
          printer.tableCustom([
            { text: item.name, align: "LEFT", bold: true },
            {
              text: String(item.quantity ? item.quantity : "1"),
              align: "CENTER",
              bold: true,
            },
            {
              text: String(`${rupees}${item.price}`),
              align: "RIGHT",
            },
          ]),
          printer.newLine()
        );
      });
    }
    printer.underline(true);
    printer.drawLine("-");
    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();

    printer.setTextQuadArea();
    printer.alignRight();
    printer.bold(true);
    printer.println("TOTAL");
    printer.newLine();
    printer.println(`${rupees}${totalPrice}`);
    printer.newLine();

    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();
    printer.alignCenter();
    printer.bold(true);
    printer.println("Thanks For Coming.");
    printer.println("Please Visit Again!");
    printer.newLine();
    printer.printQR("https://linktr.ee/foodieshub.blr");
    printer.partialCut();


    printer.setTypeFontB();
    printer.bold(true);
    printer.alignCenter();

    printer.println("KITCHEN ORDER");
    printer.alignRight();
    printer.bold(true);
    printer.println(`Ord No : ${orders}`)
    printer.println(formattedDate);
    printer.println(
      `${hour}:${minutes < 9 ? "0" + minutes : minutes}:${
        seconds < 9 ? "0" + seconds : seconds
      }`
    );
    printer.setTextNormal();
    printer.tableCustom([
      { text: "Food Item", align: "LEFT", bold: true },
      { text: "Quantity", align: "RIGHT", bold: true },
    ]);
    printer.newLine();

    {
      items.map((item) => {
        return (
          printer.tableCustom([
            { text: item.name, align: "LEFT", bold: true },
            {
              text: String(item.quantity ? item.quantity : "1"),
              align: "RIGHT",
              bold: true,
            },
          ]),
          printer.drawLine("-")
        );
      });
    }

    printer.newLine();
    
    printer.cut();

    await printer.execute();

    return res.json({
      message: "success",
    });

  } 
  catch (error) {
    console.error("error", error);
    return res.json({
      message: "failed",
      error: "PRINTER EXCUTION PROBLEM",
    });
  }
  
});

app.post("/printorderonly", async (req, res) => {

  await printer.clear(); 

  const { items, totalPrice ,order , orderType , payStatus , payMode} = await req.body;

  if (items.length === 0 || !totalPrice) return;

  const orders = (order < 9 ? `0${order}`:order) || orderSafe;

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const hour = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();


    try {
    printer.setTypeFontB();
    printer.alignRight();
    printer.setTextNormal();
    printer.bold(true);
    printer.println(`Order No : ${orders}`)
    printer.println(formattedDate);
    printer.println(
      `${hour}:${minutes < 9 ? "0" + minutes : minutes}:${
        seconds < 9 ? "0" + seconds : seconds
      }`
    );
    printer.newLine();
    printer.newLine();
    //
    printer.getWidth();
    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();
    printer.setTextQuadArea();
    printer.alignCenter();
    printer.bold(true);
    printer.println("Murugan Hotel");
    // Draws a line
    printer.newLine();
    printer.newLine();

    printer.setTextNormal();
    printer.tableCustom([
      { text: "Food", align: "LEFT" },
      { text: "Quantity", align: "CENTER", bold: true },
      { text: "Price", align: "RIGHT" },
    ]);
    printer.newLine();

    {
      items.map((item) => {
        return (
          printer.tableCustom([
            { text: item.name, align: "LEFT", bold: true },
            {
              text: String(item.quantity ? item.quantity : "1"),
              align: "CENTER",
              bold: true,
            },
            {
              text: String(`${rupees}${item.price}`),
              align: "RIGHT",
            },
          ]),
          printer.newLine()
        );
      });
    }
    printer.underline(true);
    printer.drawLine("-");
    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();

    printer.setTextQuadArea();
    printer.alignRight();
    printer.bold(true);
    printer.println("TOTAL");
    printer.newLine();
    printer.println(`${rupees}${totalPrice}`);
    printer.newLine();

    printer.setTextDoubleWidth();
    printer.setTextDoubleHeight();
    printer.alignCenter();
    printer.bold(true);
    printer.println("Thanks For Coming.");
    printer.println("Please Visit Again!");
    printer.newLine();
    printer.printQR("https://linktr.ee/foodieshub.blr");
    printer.partialCut();


    printer.setTypeFontB();
    printer.bold(true);
    printer.alignCenter();
    printer.cut();
    
    await printer.execute();

    return res.json({
      message: "success",
    });

  } 
  catch (error) {
    console.error("error", error);
    return res.json({
      message: "failed",
      error: "PRINTER EXCUTION PROBLEM",
    });
  }
  
});


app.post("/kitchen", async (req, res) => {
 await printer.clear();

  const { items } = await req.body;

  if (items.length === 0) throw Error("INVALID Length");

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const hour = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();

  try {
    printer.setTypeFontB();
    printer.bold(true);
    printer.alignCenter();

    printer.println("KITCHEN ORDER");
    printer.alignRight();
    printer.println(formattedDate);
    printer.println(
      `${hour}:${minutes < 9 ? "0" + minutes : minutes}:${
        seconds < 9 ? "0" + seconds : seconds
      }`
    );
    printer.setTextNormal();
    printer.tableCustom([
      { text: "Food Item", align: "LEFT", bold: true },
      { text: "Quantity", align: "RIGHT", bold: true },
    ]);
    printer.newLine();

    {
      items.map((item) => {
        return (
          printer.tableCustom([
            { text: item.name, align: "LEFT", bold: true },
            {
              text: String(item.quantity ? item.quantity : "1"),
              align: "RIGHT",
              bold: true,
            },
          ]),
          printer.drawLine("-")
        );
      });
    }

    printer.newLine();
    printer.cut();

    await printer.execute();
    return res.json({
      message: "success",
    });
  } catch (error) {
    console.error("error", error);
    return res
      .status(402)
      .json({ message: "failed", error: "PRINTER EXCUTION PROBLEM" });
  }
});

app.post("/testprint", async (req, res) => {
  console.log(req.body);
  res.json({ message: "ok" });
});

app.get("/test", async (req, res) => {
  printer.println("zzz");
  await printer.execute();
  res.send("yes");
});

async function clearPrinterQueue() {
  try {
    await printer.clear();
    console.log("Cleared pending print jobs.");
  } catch (err) {
    console.error("Failed to clear print jobs:", err);
  }
}

app.listen(PORT, async (req, res) => {
 await clearPrinterQueue() 
  console.log(`PORT IS RUNNING ON ${PORT}`);
});
     