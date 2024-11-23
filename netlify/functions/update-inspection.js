async function updateInspection(inspectorName, inspectionResult, inspectionDocument, discordUsername) {
    const updatedData = {
        inspectorName: inspectorName,
        inspectionResult: inspectionResult,
        inspectionDocument: inspectionDocument,
        discordUsername: discordUsername
    };

    try {
        console.log('Sending inspection update:', updatedData); // Debug log
        const response = await axios.post('/.netlify/functions/update-inspection', updatedData);
        if (response.status === 200) {
            alert('Inspection updated successfully!');
        }
    } catch (error) {
        console.error('Error updating inspection:', error);
        alert('Failed to update inspection.');
    }
}

// Event listener for the send button
document.getElementById('send-inspection').addEventListener('click', () => {
    const discordUsername = document.getElementById('discord-username').value;
    const inspectorName = document.getElementById(`inspectorName-${discordUsername}`).value;
    const inspectionResult = document.getElementById(`inspectionResult-${discordUsername}`).value;
    const inspectionDocument = document.getElementById(`inspectionDocument-${discordUsername}`).value;

    // Debugging logs
    console.log('Discord Username:', discordUsername);
    console.log('Inspector Name:', inspectorName);
    console.log('Inspection Result:', inspectionResult);
    console.log('Inspection Document:', inspectionDocument);

    // Ensure values are populated correctly before updating
    if (discordUsername && inspectorName && inspectionResult && inspectionDocument) {
        updateInspection(inspectorName, inspectionResult, inspectionDocument, discordUsername);
    } else {
        alert('Please fill in all fields!');
    }
});
