import PdfPrinter from "pdfmake"

const generatePDFStream = async data => {
    const fonts = {
        Roboto: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique"
        }
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content: [data.name, data.surname, data.title, data.bio]
    }

    const options = {
        // ...
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
    pdfReadableStream.end()

    return pdfReadableStream
}

export default generatePDFStream
