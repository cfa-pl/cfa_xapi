# cfa_xapi
CFA Interactivity xAPI Library - Fetch-Based Implementation

A lightweight JavaScript library for creating and sending xAPI statements using the native fetch API.

This client is designed for simplicity and ease of integration. You can include it directly in your HTML and begin sending statements to an LRS (Learning Record Store) immediately.

Author: Tyrone Bishop, Paul Read
Initial Release: June 10, 2024
Version: 1.0.1

License:Proprietary

Usage:

Include the script in the interactivity HTML:

<script src="xAPI.js"></script>

Create xAPI statements using the provided helper functions.

Send a statement using: sendXAPIStatement(statement);