require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const logger = require('./logger');  // Import the logger

const app = express();
const port = process.env.PORT || 4400;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Utility function to normalize phone number
const normalizePhoneNumber = (number) => {
  // Remove all non-digits
  let clean = number.replace(/\D/g, '');

  // If the number starts with '880', remove the leading '88' (country code)
  if (clean.startsWith('880')) {
    clean = clean.slice(2); // Remove the first two characters ('88')
  }

  return clean;
};

// Function to merge two contacts
const mergeContacts = async (primaryContactId, secondaryContactId) => {
  try {
    const mergeData = {
      primaryObjectId: primaryContactId,
      objectIdToMerge: secondaryContactId
    };
    const response = await axios.post(
      `https://api.hubapi.com/crm/v3/objects/contacts/merge`,
      mergeData,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    logger.info(`Successfully merged contacts: ${primaryContactId} and ${secondaryContactId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error merging contacts: ${error.response?.data || error.message}`);
    throw new Error('Failed to merge contacts');
  }
};

app.get("/", async (req, res) => {
  res.send("Hello creativeit")
})

app.get('/creativeit', (req, res) => {
  res.send("Hello from creativeit!");
});

// Routes
app.post('/webhook/deduplicate', async (req, res) => {
  let newID = "";
  const { propertyValue } = req.body[0];
  if (!propertyValue) {
    logger.error('propertyValue is required in the request body');
    return res.status(400).json({ error: 'propertyValue is required in the request body' });
  }

  // Normalize the incoming phone number
  const normalizedNumber = normalizePhoneNumber(propertyValue);

  // Build the search payload with OR logic across multiple phone fields
  const searchPayload = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'phone',
            operator: 'CONTAINS_TOKEN',
            value: propertyValue
          }
        ]
      },
      {
        filters: [
          {
            propertyName: 'phone',
            operator: 'CONTAINS_TOKEN',
            value: normalizedNumber
          }
        ]
      },
      {
        filters: [
          {
            propertyName: 'phone',
            operator: 'CONTAINS_TOKEN',
            value: "88" + normalizedNumber
          }
        ]
      },
      {
        filters: [
          {
            propertyName: 'mobilephone',
            operator: 'CONTAINS_TOKEN',
            value: normalizedNumber
          }
        ]
      },
      {
        filters: [
          {
            propertyName: 'secondary_phone_number',
            operator: 'CONTAINS_TOKEN',
            value: normalizedNumber
          }
        ]
      }
    ],
    properties: [
      'phone',
      'firstname',
      'lastname',
      'email',
      'hs_object_id',
      'createdate',
      'lastmodifieddate'
    ],
    limit: 100
  };

  try {
    // Search for matching contacts in HubSpot
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      searchPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const contacts = response.data.results;

    logger.info(`Found ${contacts.length} contacts matching phone number: ${normalizedNumber}`);

    // If multiple contacts are found, merge them
    if (contacts.length > 1) {
      // Sort contacts by the createdAt field (ascending order) to find the oldest (primary) contact
      contacts.sort((a, b) => new Date(a.properties.createdate) - new Date(b.properties.createdate));

      // The first contact in the sorted list will be the primary contact
      let primaryContact = contacts[0];
      newID = primaryContact.id;

      // Merge the remaining contacts into the primary contact
      for (let i = 1; i < contacts.length; i++) {
        const secondaryContact = contacts[i];
        let mergeResponce = await mergeContacts(newID, secondaryContact.id);
        if (mergeResponce.id) {
          newID = mergeResponce.id;
        }
      }
      logger.info(`Contacts merged successfully. Primary contact ID: ${newID}`);
    }

    // Send success response
    if (contacts.length > 1) {
      return res.status(200).json({
        message: 'Contacts Merged Successfully',
        newID: newID
      });
    } else {
      logger.info('No duplicates found for phone number: ' + normalizedNumber);
      return res.status(200).json({
        message: 'No duplicate found'
      });
    }
  } catch (error) {
    logger.error('Error fetching or merging contacts:', error.response?.data || error.message);

    // Send error response
    return res.status(500).json({
      error: 'Failed to fetch or merge contacts',
      details: error.response?.data || error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
