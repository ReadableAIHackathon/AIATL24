const getSimplification = require("../operations/getSimplification");
const Content = require("../models/Content");

module.exports = async ({ ContentID, SectionNumber, Level }, options) => {
  try {
    // If options are provided, return all content with specific fields (projection)
    if (options) {
      return await Content.find({}, options);
    }

    // If no SectionNumber is provided, return the entire content document
    if (!SectionNumber) {
      const entireContent = await Content.findOne({ ContentID });
      return entireContent;
    }

    // Query to find the document by ContentID
    const result = await Content.findOne({ ContentID });

    // Ensure the result exists and fetch the specific section based on SectionNumber
    if (result && result.Sections) {
      const section = result.Sections.find(
        (sec) => sec.SectionNumber === SectionNumber
      );

      if (section) {
        // Find the specific SubLevelText based on the provided Level
        const subLevel = section.SubLevelText.find(
          (sub) => sub.Level === Level
        );

        // Return section and subLevel if found
        return {
          Title: result.Title,
          Author: result.Author,
          Section: result.Sections[0],
          TotalSections: result.TotalSections,
          SubLevel: subLevel || {
            Level: Level,
            Text: await getSimplification({
              ContentID,
              SectionNumber,
              Target: Level,
            }),
          },
        };
      }
    }

    // If no matching section or sublevel is found, use getSimplification and return new data
    const simplifiedText = await getSimplification({
      ContentID,
      SectionNumber,
      Target: Level,
    });

    return {
      Title: result?.Title,
      Author: result?.Author,
      Section: result?.Sections[0],
      TotalSections: result.TotalSections,
      SubLevel: {
        Level: Level,
        Text: simplifiedText,
      },
    };
  } catch (error) {
    console.error("Error fetching section and level:", error);
    return null;
  }
};
