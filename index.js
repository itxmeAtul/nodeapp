const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const data = require("./src/data/database.json");
const hbs = require("handlebars");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.listen(5000, () => {
  console.log(`Server is running on port 5000.`);
});

app.get("/message", (req, res) => {
  return res.json({ message: "Hello from server!" });

  const printPdf = async (templatePath, data) => {
    const templateHtml = fs.readFileSync(
      path.join(
        process.cwd(),
        process.platform === "linux"
          ? `/src/template/${templatePath}.html`
          : `src\\template\\${templatePath}.html`
      ),
      "utf8"
    );

    const template = hbs.compile(templateHtml);

    hbs.registerHelper("json", function (context) {
      // console.log('some contecst',context, JSON.stringify(context))
      return JSON.stringify(context);
    });

    // console.log(tempData);
    const html = template(data);
    // console.log(html);
    let milis = Math.round(+new Date() / 1000); //new Date();
    // milis = milis.getTime();

    const pdfPath =
      process.platform === "linux"
        ? path.join(process.cwd() + "/src/TempPdfs", `${milis}.pdf`)
        : path.join("src\\TempPdfs", `${milis}.pdf`);

    let options = {};

    options = {
      path: pdfPath,
    };

    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      ...options,
    });
    await browser.close();

    return pdf;
  };

  return printPdf("sample", data).then((pdf) => {
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
    });
    res.send(pdf);
  });
});

app.post("/generatePdf", async (req, res) => {
  //   return res.json({ message: "Hello from server!" });
  let tdata = req.body;
  // console.log(req.body);
  // return;

  const printPdf = async (templatePath, data) => {
    const templateHtml = fs.readFileSync(
      path.join(
        process.cwd(),
        process.platform === "linux"
          ? `/src/template/${templatePath}.html`
          : `src\\template\\${templatePath}.html`
      ),
      "utf8"
    );
    const template = hbs.compile(templateHtml);
    hbs.registerHelper("json", function (context) {
      return JSON.stringify(context);
    });
    const html = template(data);
    let milis = Math.round(+new Date() / 1000); //new Date();
    const pdfPath =
      process.platform === "linux"
        ? path.join(process.cwd() + "/src/TempPdfs", `${milis}.pdf`)
        : path.join("src\\TempPdfs", `${milis}.pdf`);
    let options = {};
    options = {
      path: pdfPath,
    };
    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      ...options,
    });
    await browser.close();
    fs.unlink(pdfPath);
    return pdf;
  };

  return await printPdf("sample", tdata).then((pdf) => {
    res.contentType("application/pdf");
    res.status(200).send(pdf);
  });
});
