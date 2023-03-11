const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const data = require("./src/data/database.json");
const hbs = require("handlebars");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.listen(5000, () => {
  console.log(`Server is running on port 5000.`);
});

app.get("/message", (req, res) => {
  //   return res.json({ message: "Hello from server!" });

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
      headless: true,
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
  //   const compile = async function (templateName, data) {
  //     const filePath = path.join(
  //       process.cwd(),
  //       "src/template",
  //       `${templateName}.hbs`
  //     );
  //     //   console.log(data, "data");
  //     const html = await fs.readFile(filePath, "utf-8");
  //     return hbs.compile(html)(data);
  //   };

  //   async function printPdf() {
  //     try {
  //       // Create a browser instance
  //       const browser = await puppeteer.launch();
  //       // Create a new page
  //       const page = await browser.newPage();
  //       const content = await compile("sample", data);
  //       await page.setContent(content, { waitUntil: "domcontentloaded" });

  //       // To reflect CSS used for screens instead of print
  //       await page.emulateMediaType("screen");

  //       // Downlaod the PDF
  //       const pdf = await page.pdf({
  //         path: `tempFile.pdf`,
  //         // margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
  //         printBackground: true,
  //         format: "A4",
  //       });

  //       //   Close the browser instance
  //       await browser.close();
  //       //   await fs.unlinkSync(samplePdfFile);

  //       res.set({
  //         "Content-Type": "application/pdf",
  //         // "Content-Length": pdf.length,
  //       });

  //       res.send(pdf);
  //     } catch (error) {
  //       console.log("our eroor ", error);
  //     }
  //   }
  //   return printPdf();
});
