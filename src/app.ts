import * as fs from "fs";
import * as csvParser from "csv-parser";

interface Redirect {
  source: string;
  destination: string;
  statusCode: number;
}

function extractURIPath(url: string): string {
  const urlObj = new URL(url);
  return urlObj.pathname; // Esto devuelve solo el URI Path
}

function convertCSVtoJSON(csvFilePath: string, jsonFilePath: string): void {
  const redirects: Redirect[] = [];

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (row: any) => {
      const existingIndex = redirects.findIndex(
        (redirect) => redirect.source === extractURIPath(row.source)
      );

      if (existingIndex !== -1) {
        // Si ya existe, sobrescribe la entrada existente
        redirects[existingIndex] = {
          source: extractURIPath(row.source),
          destination: row.destination,
          statusCode: parseInt(row.statusCode),
        };
      } else {
        // Si no existe, simplemente agrega la nueva entrada
        redirects.push({
          source: extractURIPath(row.source),
          destination: row.destination,
          statusCode: parseInt(row.statusCode),
        });
      }
    })
    .on("end", () => {
      const jsonData = {
        redirects: redirects,
      };

      fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
      console.log(`JSON generado exitosamente en ${jsonFilePath}`);
    });
}

// Uso del script
const csvFilePath = "redirects.csv"; // Ruta del archivo CSV
const jsonFilePath = "output/vercel.json"; // Ruta del archivo JSON de salida

convertCSVtoJSON(csvFilePath, jsonFilePath);
