// Importation de la fonction depuis le fichier dallE.js
import { getImageFromDallE } from './dallE.js';

const endpointURL = 'http://localhost:3001/chat';

let outputElement, submitButton, inputElement, historyElement, buttonElement;


window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    buttonElement = document.querySelector('button');
    buttonElement.onclick = clearInput;
}

function clearInput() {
    inputElement.value = '';
}

async function getMessage() {
    let prompt = inputElement.value.trim();
    let styleOption = document.querySelector('#style-option').value;
    let timeOfDay = document.querySelector('#time-of-day').value;
    let styleOptions = 'avec les options de style suivantes : ' + styleOption + 'et' + timeOfDay;

// Utilisez `styleOption` et `timeOfDay` pour construire les prompts complets


    if (prompt.startsWith('/image')) {
        // On retire le '/image' pour traiter la chaîne de caractères suivante
        let description = prompt.substring('/image'.length).trim();
        let fullDescription = `génère un prompt pour Dall-E afin d'obtenir une image de ${description}, ${styleOptions}`;
        // Demander à GPT-3.5 de générer une description pour Dall-E
        console.log('Prompt pour Dall-E:', fullDescription);
        generateImagePrompt(fullDescription);
    } else {
        getResponseFromServer(prompt); // Traitement normal pour les autres prompts
    }

    // Vider l'input après la soumission
    inputElement.value = '';
}

async function generateImagePrompt(description) {
    try {
        const promptData = new FormData();
        promptData.append('prompt', `Créez une description détaillée d'une image de : ${description}`);

        // Appel à GPT-3.5 pour générer une description d'image pour Dall-E
        const response = await fetch(endpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();
        const generatedPrompt = data.choices[0].message.content;

        console.log('Prompt Généré pour Dall-E:', generatedPrompt);
        // Envoi du prompt généré à Dall-E
        getImage(generatedPrompt);
    } catch (error) {
        console.error('Erreur lors de la génération du prompt pour Dall-E:', error);
    }
}

async function getImage(prompt) {
    let images = await getImageFromDallE(prompt);
    console.log(images);

    if (Array.isArray(images.data)) {
        images.data.forEach(imageObj => {
            // Assurez-vous que imageObj.url est une chaîne de caractères
            if (typeof imageObj.url === 'string') {
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');

                const imgElement = document.createElement('img');
                imgElement.src = imageObj.url; // Utilisez l'URL de l'image
                imgElement.alt = "Image générée";
                imgElement.width = 256;
                imgElement.height = 256;

                imageContainer.appendChild(imgElement);
                outputElement.appendChild(imageContainer);
            }
        });
    }
}

async function getResponseFromServer(prompt) {
    try {
        const promptData = new FormData();
        promptData.append('prompt', prompt);

        const response = await fetch(endpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();

        const chatGptResponseTxt = data.choices[0].message.content;
        const pElementChat = document.createElement('p');
        pElementChat.textContent = chatGptResponseTxt;
        outputElement.append(pElementChat);

        if (data.choices[0].message.content) {
            const pElement = document.createElement('p');
            pElement.textContent = inputElement.value;
            pElement.onclick = () => {
                inputElement.value = pElement.textContent;
            };
            historyElement.append(pElement);
        }
    } catch (error) {
        console.log(error);
    }
}
