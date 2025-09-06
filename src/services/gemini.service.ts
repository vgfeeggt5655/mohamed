
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: You must configure process.env.API_KEY in your deployment environment.
    // Do not hardcode the API key here.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateBioSummary(userData: any, userRepos: any[]): Promise<string> {
    const repoNames = userRepos.map(repo => repo.name).join(', ');
    const prompt = `
      Based on the following GitHub profile data, generate a professional and engaging summary (around 2-3 sentences) suitable for a tech recruiter or hiring manager.
      Highlight potential key skills, interests, and project experience based on the repository names and user bio.
      Keep the tone positive and forward-looking.

      **Profile Data:**
      - **Name:** ${userData.name}
      - **Bio:** ${userData.bio || 'Not provided.'}
      - **Followers:** ${userData.followers}
      - **Public Repositories Count:** ${userData.public_repos}
      - **Recent Repository Names:** ${repoNames}

      Generate the summary now.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating summary with Gemini API:', error);
      return 'Could not generate AI summary due to an error. Please check the console.';
    }
  }
}
