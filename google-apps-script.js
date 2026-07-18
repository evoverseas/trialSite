/* ============================================================
   EV OVERSEAS — Google Apps Script Backend (Multi-Application & Counselor API)
   Handles student fetching, multi-application tracking, and counselor updates
   ============================================================ */

/**
 * Serves the API for student and counselor dashboards
 * 
 * @param {Object} e - Request parameters
 * @param {string} [e.parameter.email] - Student's email address or 'all' for counselor view
 * @param {string} [e.parameter.action] - Action type ('getAllStudents')
 * @returns {Object} JSON response
 */
function doGet(e) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        const action = e.parameter.action;
        const email = e.parameter.email;

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const studentSheet = ss.getSheetByName('Students');
        const appSheet = ss.getSheetByName('Applications');
        const milestoneSheet = ss.getSheetByName('Milestones');
        const docSheet = ss.getSheetByName('Documents');

        if (!studentSheet || !appSheet) {
            return output.setContent(JSON.stringify({
                error: 'Configuration Error',
                message: 'Required tabs (Students, Applications) not found in Google Sheet'
            }));
        }

        // ============================================
        // COUNSELOR VIEW: Get All Students and Applications
        // ============================================
        if (action === 'getAllStudents' || email === 'all') {
            const studentData = studentSheet.getDataRange().getValues().slice(1);
            const appData = appSheet.getDataRange().getValues().slice(1);
            const milestoneData = milestoneSheet ? milestoneSheet.getDataRange().getValues().slice(1) : [];
            const docData = docSheet ? docSheet.getDataRange().getValues().slice(1) : [];

            const allStudents = studentData.map(studentRow => {
                const studentEmail = studentRow[0];
                const studentApps = appData
                    .filter(appRow => appRow[0] === studentEmail)
                    .map(appRow => {
                        const appId = appRow[1];
                        const milestones = milestoneData
                            .filter(mRow => mRow[0] === appId)
                            .map(mRow => ({
                                stepNumber: parseInt(mRow[1]) || 0,
                                stepName: mRow[2],
                                status: mRow[3],
                                date: formatDate(mRow[4]),
                                notes: mRow[5] || ''
                            }))
                            .sort((a, b) => a.stepNumber - b.stepNumber);

                        const documents = docData
                            .filter(dRow => dRow[0] === appId)
                            .map(dRow => ({
                                name: dRow[1],
                                status: dRow[2],
                                submittedDate: formatDate(dRow[3]),
                                notes: dRow[4] || ''
                            }));

                        const completedSteps = milestones.filter(m => m.status === 'Completed').length;

                        return {
                            applicationId: appId,
                            country: appRow[2],
                            university: appRow[3],
                            course: appRow[4],
                            intake: appRow[5],
                            currentStep: parseInt(appRow[6]) || 1,
                            overallStatus: appRow[7] || 'Active',
                            startDate: formatDate(appRow[8]),
                            lastUpdated: formatDate(appRow[9]),
                            notes: appRow[10] || '',
                            milestones: milestones,
                            documents: documents,
                            progressPercentage: Math.round((completedSteps / 6) * 100)
                        };
                    });

                return {
                    email: studentRow[0],
                    name: studentRow[1],
                    phone: studentRow[2],
                    counselorName: studentRow[3],
                    counselorEmail: studentRow[4],
                    counselorPhone: studentRow[5],
                    registrationDate: formatDate(studentRow[6]),
                    notes: studentRow[7] || '',
                    applications: studentApps
                };
            });

            return output.setContent(JSON.stringify({
                success: true,
                students: allStudents,
                totalStudents: allStudents.length
            }));
        }

        // ============================================
        // STUDENT VIEW: Get Single Student Data
        // ============================================
        if (!email) {
            return output.setContent(JSON.stringify({
                error: 'Email parameter is required',
                message: 'Please provide an email address'
            }));
        }

        const studentData = studentSheet.getDataRange().getValues().slice(1);
        const studentRow = studentData.find(row => row[0].toLowerCase() === email.toLowerCase());

        if (!studentRow) {
            return output.setContent(JSON.stringify({
                error: 'Account Not Found',
                message: 'No account found for ' + email + '. Please contact your counselor.',
                email: email
            }));
        }

        const student = {
            email: studentRow[0],
            name: studentRow[1],
            phone: studentRow[2],
            counselorName: studentRow[3],
            counselorEmail: studentRow[4],
            counselorPhone: studentRow[5],
            registrationDate: formatDate(studentRow[6]),
            notes: studentRow[7] || ''
        };

        const appData = appSheet.getDataRange().getValues().slice(1);
        const milestoneData = milestoneSheet ? milestoneSheet.getDataRange().getValues().slice(1) : [];
        const docData = docSheet ? docSheet.getDataRange().getValues().slice(1) : [];

        const applications = appData
            .filter(row => row[0].toLowerCase() === email.toLowerCase())
            .map(row => {
                const appId = row[1];
                const milestones = milestoneData
                    .filter(mRow => mRow[0] === appId)
                    .map(mRow => ({
                        stepNumber: parseInt(mRow[1]) || 0,
                        stepName: mRow[2],
                        status: mRow[3],
                        date: formatDate(mRow[4]),
                        notes: mRow[5] || ''
                    }))
                    .sort((a, b) => a.stepNumber - b.stepNumber);

                const documents = docData
                    .filter(dRow => dRow[0] === appId)
                    .map(dRow => ({
                        name: dRow[1],
                        status: dRow[2],
                        submittedDate: formatDate(dRow[3]),
                        notes: dRow[4] || ''
                    }));

                const completedSteps = milestones.filter(m => m.status === 'Completed').length;

                return {
                    applicationId: appId,
                    country: row[2],
                    university: row[3],
                    course: row[4],
                    intake: row[5],
                    currentStep: parseInt(row[6]) || 1,
                    overallStatus: row[7] || 'Active',
                    startDate: formatDate(row[8]),
                    lastUpdated: formatDate(row[9]),
                    notes: row[10] || '',
                    milestones: milestones,
                    documents: documents,
                    progressPercentage: Math.round((completedSteps / 6) * 100)
                };
            });

        return output.setContent(JSON.stringify({
            success: true,
            student: student,
            applications: applications,
            totalApplications: applications.length
        }));

    } catch (error) {
        return output.setContent(JSON.stringify({
            error: 'Server Error',
            message: 'An unexpected error occurred: ' + error.message
        }));
    }
}

/**
 * Handles Counselor updates to Student Application steps, notes, and document status
 * 
 * @param {Object} e - Request event with JSON payload
 * @returns {Object} JSON response
 */
function doPost(e) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        let payload = {};
        if (e.postData && e.postData.contents) {
            payload = JSON.parse(e.postData.contents);
        } else if (e.parameter) {
            payload = e.parameter;
        }

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const appSheet = ss.getSheetByName('Applications');
        const milestoneSheet = ss.getSheetByName('Milestones');
        const docSheet = ss.getSheetByName('Documents');

        const { applicationId, currentStep, overallStatus, notes, documents } = payload;

        if (!applicationId) {
            return output.setContent(JSON.stringify({
                success: false,
                message: 'applicationId is required for update'
            }));
        }

        const appData = appSheet.getDataRange().getValues();
        let appRowIndex = -1;

        for (let i = 1; i < appData.length; i++) {
            if (appData[i][1] === applicationId) {
                appRowIndex = i + 1; // 1-indexed row number
                break;
            }
        }

        if (appRowIndex !== -1) {
            // Update current step (col G / index 6), status (col H / index 7), last updated (col J / index 9), notes (col K / index 10)
            if (currentStep) appSheet.getRange(appRowIndex, 7).setValue(currentStep);
            if (overallStatus) appSheet.getRange(appRowIndex, 8).setValue(overallStatus);
            appSheet.getRange(appRowIndex, 10).setValue(new Date());
            if (notes !== undefined) appSheet.getRange(appRowIndex, 11).setValue(notes);
        }

        // Update Document Statuses if provided
        if (documents && Array.isArray(documents) && docSheet) {
            const docData = docSheet.getDataRange().getValues();
            documents.forEach(doc => {
                for (let j = 1; j < docData.length; j++) {
                    if (docData[j][0] === applicationId && docData[j][1] === doc.name) {
                        docSheet.getRange(j + 1, 3).setValue(doc.status); // Col C: status
                        if (doc.notes) docSheet.getRange(j + 1, 5).setValue(doc.notes); // Col E: notes
                    }
                }
            });
        }

        return output.setContent(JSON.stringify({
            success: true,
            message: 'Application updated successfully!'
        }));

    } catch (err) {
        return output.setContent(JSON.stringify({
            success: false,
            message: 'Failed to update: ' + err.message
        }));
    }
}

/**
 * Format date for consistent display
 */
function formatDate(date) {
    if (!date) return '';
    try {
        if (date instanceof Date) {
            return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }
        return date.toString();
    } catch (e) {
        return '';
    }
}

