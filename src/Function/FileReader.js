import Papa from 'papaparse';

const filesReader = async (files,setParsedData) =>{

  const result = {}
  for (const fileName of files)
 {
  try {
   const res = await fetch(`/csv/${fileName}`);
   const text = await res.text();

   const { data } = Papa.parse(text, {
     header: true,
     skipEmptyLines: true
   });
   result[fileName] = data;
   // Ara sonucu görebilmek istersen:
   setParsedData({ ...result });
  console.log("hey")
  } catch (error) {
   console.error(`Dosya okunurken hata: ${fileName}`, error);
  }
 }
 return result;
}
export default filesReader