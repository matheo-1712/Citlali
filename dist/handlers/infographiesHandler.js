"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfographics = void 0;
const getInfographics = async (character) => {
    try {
        const url = 'https://keqingmains.com/i/amber-burgeon-build/';
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(error);
    }
};
exports.getInfographics = getInfographics;
