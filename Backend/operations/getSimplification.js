const simplify = require("../methods/simplify");
const Content = require("../models/Content");

module.exports = async (filters, options) => {
  const data = await Content.findOne(
    { ContentID: filters.ContentID }, // Find the document by ContentID
    { Sections: { $elemMatch: { SectionNumber: filters.SectionNumber } } } // Use $elemMatch to find the specific section within the array
  );

  if (!data?.Sections?.length) return false;
  if (!data?.Sections[0]?.SubLevelText.length && data?.Sections[0])
    data.Sections[0].SubLevelText = [];
  data.Sections[0].SubLevelText.push({
    Level: 5,
    Text: data.Sections[0].OriginalText,
  });

  let text_dict = {};
  for (const x of data.Sections[0].SubLevelText)
    text_dict[x["Level"]] = x["Text"];
  if (text_dict[filters.Target]) return text_dict[filters.Target];

  const simplified = await simplify(text_dict, filters.Target);

  await Content.updateOne(
    {
      ContentID: filters.ContentID,
      "Sections.SectionNumber": filters.SectionNumber,
    },
    {
      $push: {
        "Sections.$.SubLevelText": { Level: filters.Target, Text: simplified },
      },
    }
  );

  return simplified;
};

// Content.find().then(async (data) => {
//   let count = 0;
//   for (const x of data) {
//     if (count < 2) {
//       ++count;
//       continue;
//     }
//     for (i = 1; i <= 20; i++) {
//       for (j = 1; j < 6; j++) {
//         console.log(`#${++count} Book: ${x.Title} - Page: ${i} - Level - ${j}`);
//         await module.exports({
//           ContentID: x.ContentID,
//           SectionNumber: i,
//           Target: j,
//         });
//       }
//     }
//   }
// });
