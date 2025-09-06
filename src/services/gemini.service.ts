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
      throw new Error("لم يتم تعيين متغير البيئة API_KEY.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateBioSummary(userData: any, userRepos: any[]): Promise<string> {
    const repoNames = userRepos.map(repo => repo.name).join(', ');
    const prompt = `
      بناءً على بيانات ملف GitHub التالية، قم بإنشاء ملخص احترافي وجذاب (حوالي 2-3 جمل) مناسب لمسؤول توظيف تقني أو مدير توظيف.
      سلط الضوء على المهارات الرئيسية المحتملة والاهتمامات وخبرة المشاريع بناءً على أسماء المستودعات والسيرة الذاتية للمستخدم.
      حافظ على نبرة إيجابية وتطلعية.

      **بيانات الملف الشخصي:**
      - **الاسم:** ${userData.name}
      - **السيرة الذاتية:** ${userData.bio || 'غير متوفرة.'}
      - **المتابعون:** ${userData.followers}
      - **عدد المستودعات العامة:** ${userData.public_repos}
      - **أسماء المستودعات الأخيرة:** ${repoNames}

      قم بإنشاء الملخص الآن.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating summary with Gemini API:', error);
      return 'تعذر إنشاء ملخص بالذكاء الاصطناعي بسبب خطأ. يرجى التحقق من وحدة التحكم.';
    }
  }
}