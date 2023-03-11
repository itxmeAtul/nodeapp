const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

export const printPdf = async (templatePath, data, pOutputType) => {
  const templateHtml = fs.readFileSync(
    path.join(
      process.cwd(),
      process.platform === "linux"
        ? `/src/template/${templatePath}.html`
        : `src\\html-reports\\Templates\\${templatePath}.html`
    ),
    "utf8"
  );

  const template = handlebars.compile(templateHtml);

  handlebars.registerHelper("json", function (context) {
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
