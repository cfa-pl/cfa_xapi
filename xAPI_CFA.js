/**
 * xAPI Client Library - Fetch-Based Implementation
 *
 * A lightweight library for creating and sending xAPI statements using fetch.
 * Include this script in your HTML head section and use the global functions.
 * 
 * Author: Tyrone Bishop, Paul Read
 * Date: 2024-06-10
 * Version: 2.0.0
 * License: Proprietary
 * 
 * Usage:
 * 1. Include this script: <script src="xAPI.js"></script>
 * 2. Create statements using helper functions
 * 3. Send statements using sendXAPIStatement()
 */

// Global xAPI configuration
let xAPIConfig = {
    endpoint: '',
    username: '',
    password: '',
    version: '1.0.3'
};

/**
 * Configure the LRS connection settings
 * @param {string} endpoint - LRS endpoint URL
 * @param {string} username - LRS username/key
 * @param {string} password - LRS password/secret
 */
function configureXAPI(endpoint, username, password) {
    xAPIConfig.endpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/';
    xAPIConfig.username = username;
    xAPIConfig.password = password;
}

/**
 * Generate a UUID for statement IDs
 * @returns {string} - UUID string
 */
function generateXAPIUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Create an xAPI actor object
 * @param {string} name - Actor's name
 * @param {string} email - Actor's email (without mailto: prefix)
 * @param {string} homepage - Optional homepage URL
 * @returns {Object} - Actor object
 */
function createXAPIActor(name, email, homepage = null) {
    const actor = {
        name: name,
        mbox: 'mailto:' + email,
        objectType: 'Agent'
    };

    if (homepage) {
        actor.openid = homepage;
    }

    return actor;
}

/**
 * Create an xAPI verb object
 * @param {string} id - Verb IRI
 * @param {string} display - Display name for the verb
 * @param {string} language - Language code (default: 'en-US')
 * @returns {Object} - Verb object
 */
function createXAPIVerb(id, display, language = 'en-US') {
    return {
        id: id,
        display: {
            [language]: display
        }
    };
}

/**
 * Create an xAPI activity object
 * @param {string} id - Activity IRI
 * @param {string} name - Activity name
 * @param {string} description - Activity description
 * @param {string} type - Activity type IRI
 * @param {string} language - Language code (default: 'en-US')
 * @returns {Object} - Activity object
 */
function createXAPIActivity(id, name, description, type = 'http://adlnet.gov/expapi/activities/lesson', language = 'en-US') {
    return {
        objectType: 'Activity',
        id: id,
        definition: {
            name: {
                [language]: name
            },
            description: {
                [language]: description
            },
            type: type
        }
    };
}

/**
 * Create an xAPI result object
 * @param {boolean} completion - Whether the activity was completed
 * @param {boolean} success - Whether the activity was successful  
 * @param {number} scaledScore - Score value (0-1 for scaled scores)
 * @param {number} rawScore - Raw score value
 * @param {number} minScore - Minimum possible score
 * @param {number} maxScore - Maximum possible score
 * @param {string} duration - Duration in ISO 8601 format (e.g., 'PT30M' for 30 minutes)
 * @returns {Object} - Result object
 */
function createXAPIResult(completion = null, success = null, scaledScore = null, rawScore = null, minScore = null, maxScore = null, duration = null) {
    const result = {};

    if (completion !== null) {
        result.completion = completion;
    }

    if (success !== null) {
        result.success = success;
    }

    if (scaledScore !== null || rawScore !== null || minScore !== null || maxScore !== null) {
        result.score = {};
        if (scaledScore !== null) result.score.scaled = scaledScore;
        if (rawScore !== null) result.score.raw = rawScore;
        if (minScore !== null) result.score.min = minScore;
        if (maxScore !== null) result.score.max = maxScore;
    }

    if (duration) {
        result.duration = duration;
    }

    return result;
}

/**
 * Create an xAPI context object
 * @param {Object} instructor - Instructor agent object
 * @param {string} registration - Registration UUID
 * @param {Object} contextActivities - Context activities object
 * @param {string} language - Language code
 * @returns {Object} - Context object
 */
function createXAPIContext(instructor = null, registration = null, contextActivities = null, language = null) {
    const context = {};

    if (instructor) {
        context.instructor = instructor;
    }

    if (registration) {
        context.registration = registration;
    }

    if (contextActivities) {
        context.contextActivities = contextActivities;
    }

    if (language) {
        context.language = language;
    }

    return context;
}

/**
 * Create a complete xAPI statement
 * @param {Object} actor - The actor (learner)
 * @param {Object} verb - The verb (action)
 * @param {Object} object - The object (activity)
 * @param {Object} result - Optional result object
 * @param {Object} context - Optional context object
 * @param {string} id - Optional statement ID (will generate if not provided)
 * @param {string} timestamp - Optional timestamp (will generate if not provided)
 * @returns {Object} - Complete xAPI statement
 */
function createXAPIStatement(actor, verb, object, result = null, context = null, id = null, timestamp = null) {
    const statement = {
        id: id || generateXAPIUUID(),
        timestamp: timestamp || new Date().toISOString(),
        actor: actor,
        verb: verb,
        object: object
    };

    if (result) {
        statement.result = result;
    }

    if (context) {
        statement.context = context;
    }

    return statement;
}

/**
 * Send an xAPI statement to the configured LRS
 * @param {Object} statement - The xAPI statement object
 * @returns {Promise} - Promise resolving to the response
 */
async function sendXAPIStatement(statement) {
    // Validate configuration
    if (!xAPIConfig.endpoint || !xAPIConfig.username || !xAPIConfig.password) {
        throw new Error('xAPI not configured. Call configureXAPI() first.');
    }

    // Ensure statement has required fields
    if (!statement.id) {
        statement.id = generateXAPIUUID();
    }

    if (!statement.timestamp) {
        statement.timestamp = new Date().toISOString();
    }

    const url = xAPIConfig.endpoint + 'statements';
    const auth = btoa(xAPIConfig.username + ':' + xAPIConfig.password);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json',
                'X-Experience-API-Version': xAPIConfig.version
            },
            body: JSON.stringify(statement)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
        }

        const result = await response.json();
        console.log('xAPI Statement sent successfully:', statement.id);
        return result;

    } catch (error) {
        console.error('Error sending xAPI statement:', error);
        throw error;
    }
}

/**
 * Send multiple xAPI statements at once
 * @param {Array} statements - Array of xAPI statement objects
 * @returns {Promise} - Promise resolving to the response
 */
async function sendXAPIStatements(statements) {
    // Validate configuration
    if (!xAPIConfig.endpoint || !xAPIConfig.username || !xAPIConfig.password) {
        throw new Error('xAPI not configured. Call configureXAPI() first.');
    }

    // Ensure all statements have required fields
    statements.forEach(statement => {
        if (!statement.id) {
            statement.id = generateXAPIUUID();
        }
        if (!statement.timestamp) {
            statement.timestamp = new Date().toISOString();
        }
    });

    const url = xAPIConfig.endpoint + 'statements';
    const auth = btoa(xAPIConfig.username + ':' + xAPIConfig.password);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json',
                'X-Experience-API-Version': xAPIConfig.version
            },
            body: JSON.stringify(statements)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
        }

        const result = await response.json();
        console.log(`${statements.length} xAPI Statements sent successfully`);
        return result;

    } catch (error) {
        console.error('Error sending xAPI statements:', error);
        throw error;
    }
}

// Common verb constants for convenience
const XAPIVerbs = {
    EXPERIENCED: 'http://adlnet.gov/expapi/verbs/experienced',
    ATTENDED: 'http://adlnet.gov/expapi/verbs/attended',
    ATTEMPTED: 'http://adlnet.gov/expapi/verbs/attempted',
    COMPLETED: 'http://adlnet.gov/expapi/verbs/completed',
    PASSED: 'http://adlnet.gov/expapi/verbs/passed',
    FAILED: 'http://adlnet.gov/expapi/verbs/failed',
    ANSWERED: 'http://adlnet.gov/expapi/verbs/answered',
    INTERACTED: 'http://adlnet.gov/expapi/verbs/interacted',
    IMPORTED: 'http://adlnet.gov/expapi/verbs/imported',
    CREATED: 'http://adlnet.gov/expapi/verbs/created',
    SHARED: 'http://adlnet.gov/expapi/verbs/shared',
    VOIDED: 'http://adlnet.gov/expapi/verbs/voided'
};

// Common activity types for convenience
const XAPIActivityTypes = {
    COURSE: 'http://adlnet.gov/expapi/activities/course',
    LESSON: 'http://adlnet.gov/expapi/activities/lesson',
    ASSESSMENT: 'http://adlnet.gov/expapi/activities/assessment',
    INTERACTION: 'http://adlnet.gov/expapi/activities/interaction',
    CMI_INTERACTION: 'http://adlnet.gov/expapi/activities/cmi.interaction',
    QUESTION: 'http://adlnet.gov/expapi/activities/question',
    OBJECTIVE: 'http://adlnet.gov/expapi/activities/objective',
    LINK: 'http://adlnet.gov/expapi/activities/link'
};