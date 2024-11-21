const express = require("express");
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const app = express();
const cors = require("cors");

const PORT = 3001;

app.use(cors());
app.use(express.json());

const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  width: 48,
  removeSpecialCharacters: false,
  interface: "//localhost/POS-80-Series1",
  lineCharacter: "2", // Set character for lines - default: "-"
  // breakLine: BreakLine.WORD, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
  options: {
    timeout: 15000,
  },
});

const rupees = "Rs.";

app.post("/print", async (req, res) => {
  const { items, totalPrice } = await req.body;

  if (items.length === 0 || !totalPrice) return;
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const hour = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();

  try {
    printer.setTypeFontB();
    printer.alignRight();
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
    printer.println("FOODIE's Hub");
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
    printer.printQR("https://maps.app.goo.gl/wfUG7B2J2bXvW4KL6");
    printer.partialCut();

    const res = await printer.execute();

    if (res.toLowerCase().split(" ").join("") === "printdone") {
      return res.json({
        message: "success",
      });
    } else {
      throw Error("EXCUTION FAILED");
    }
  } catch (error) {
    console.error("error", error);
    return res.json({
      message: "failed",
      error: "PRINTER EXCUTION PROBLEM",
    });
  }
});

app.post("/kitchen", async (req, res) => {
  const { items } = await req.body;

  if (items.length === 0) return;

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

    const res = await printer.execute();

    if (res.toLowerCase().split(" ").join("") === "printdone") {
      return res.json({
        message: "SUCESS",
      });
    }
  } catch (error) {
    console.error("error", error);
    return res.json({ message: "failed", error: "PRINTER EXCUTION PROBLEM" });
  }
});

app.get("/test", (req, res) => {
  res.send("yes");
});

app.listen(PORT, (req, res) => {
  console.log(`PORT IS RUNNING ON ${PORT}`);
});
