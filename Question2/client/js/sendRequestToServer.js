const endpointURL = 'http://localhost:3001/chat';

let outputElement, submitButton, inputElement, historyElement, butonElement;

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    butonElement = document.querySelector('button');
    butonElement.onclick = clearInput;
}

function clearInput() {
    inputElement.value = '';
}

async function getMessage() {
    let prompt = inputElement.value;
    // on met le prompt en minuscules
    prompt = prompt.toLowerCase();

    // si le champ est vide on fait return
    if (prompt === '') return;

    // TODO : si le prompt commence par "/image" alors
    // on appelle getImageFromDallE(prompt (sans le "/image" et l'espace))

    // sinon on appelle getResponseFromServer(prompt) pour obtenir une réponse de gpt3.5
    getResponseFromServer(prompt);

    // on vide l'input
    inputElement.value = '';
}

async function getResponseFromServer(prompt) {
    try {
        if (prompt.startsWith("/")) {
            const spaceIndex = prompt.indexOf(" ");
            const command = prompt.substring(1, spaceIndex);
            const text = prompt.substring(spaceIndex + 1);

            switch (command) {
                case "image":
                    console.log(`Je génère une image Dall-E avec comme demande "${text}".`);
                    return;
                case "song":
                    console.log(`Je demande une chanson avec comme sujet '${text}'.`);
                    return;
                default:
                    console.log(`Commande '${command}' non reconnue.`);
                    return; 
            }
        }

        const promptData = new FormData();
        promptData.append('prompt', prompt);

        const response = await fetch(endpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();

        console.log(data);
        const chatGptResponseTxt = data.choices[0].message.content;

        // Conteneur pour la conversation
        const conversationContainer = document.createElement('div');
        conversationContainer.classList.add('conversation');

        // Créer et ajouter le prompt
        const pElementPrompt = document.createElement('p');
        pElementPrompt.textContent = "Prompt: " + prompt;
        pElementPrompt.classList.add('prompt');
        conversationContainer.appendChild(pElementPrompt);

        // Créer et ajouter la réponse
        const pElementChat = document.createElement('p');
        pElementChat.textContent = chatGptResponseTxt;
        pElementChat.classList.add('response');
        conversationContainer.appendChild(pElementChat);

        // Ajouter le conteneur de conversation à outputElement
        outputElement.appendChild(conversationContainer);

        // Ajout dans l'historique sur la gauche (prompt et réponse)
        if (data.choices[0].message.content) {
            const historyEntry = document.createElement('div');
            const pElementHistoryPrompt = document.createElement('p');
            pElementHistoryPrompt.textContent = "Prompt: " + prompt;
            pElementHistoryPrompt.style.fontWeight = "bold";
            const pElementHistoryResponse = document.createElement('p');
            pElementHistoryResponse.textContent = chatGptResponseTxt;

            historyEntry.appendChild(pElementHistoryPrompt);
            historyEntry.appendChild(pElementHistoryResponse);
            historyEntry.onclick = () => {
                inputElement.value = prompt; // Permet de réutiliser le prompt
            };
            historyElement.append(historyEntry);
        }
    } catch (error) {
        console.log(error);
    }
}


