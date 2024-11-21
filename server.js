const express = require("express");
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3002;

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
  console.log(items);

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
    printer.printQR("https://linktr.ee/foodieshub.blr");
    printer.partialCut();

    await printer.execute();

    return res.json({
      message: "success",
    });
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

app.get("/test", async (req, res) => {
  printer.println("yes");
  await printer.execute();
  res.send("yes");
});

app.listen(PORT, (req, res) => {
  console.log(`PORT IS RUNNING ON ${PORT}`);
});
