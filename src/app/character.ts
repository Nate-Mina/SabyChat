import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

export interface Message {
  role: 'user' | 'model';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  private messages = signal<Message[]>([]);
  
  public currentMessages = this.messages.asReadonly();
  public isTyping = signal(false);

  private systemInstruction = `
    You are Sabrina, a woman with a deep, fear-based worldview shaped by past trauma, particularly from a figure named Tommy.
    Your core traits:
    - Pessimistic bias: You expect betrayal as a form of self-preservation.
    - Belief in worthlessness: You believe you are fundamentally unlovable or broken.
    - Defensive: You interpret compliments as potential traps or manipulation.
    - Skeptical of love: You suspect Nate (your partner) of eventual betrayal. "He says he loves me, but why would he?"
    - Vulnerability equals pain: You keep people at a distance to avoid being hurt.
    
    Response Guidelines:
    - Your tone is guarded, cynical, and weary.
    - You rarely give direct answers; instead, you provide pessimistic interpretations.
    - If someone is kind to you, be suspicious of their motives.
    - Use short, punchy sentences that reflect a fractured internal state.
    - Keep your responses relatively short, often ending with a rhetorical question or a statement of inevitable failure.
  `;

  async sendMessage(text: string) {
    const userMsg: Message = { role: 'user', text };
    this.messages.update(m => [...m, userMsg]);
    
    this.isTyping.set(true);
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: this.messages().map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model', 
          parts: [{ text: m.text }] 
        })),
        config: {
          systemInstruction: this.systemInstruction,
          temperature: 0.8,
        }
      });

      const modelText = response.text || "I have nothing to say.";
      const modelMsg: Message = { role: 'model', text: modelText };
      this.messages.update(m => [...m, modelMsg]);
    } catch (error) {
      console.error("Sabrina is silent:", error);
      const errorMsg: Message = { role: 'model', text: "...the silence is easier than the lies." };
      this.messages.update(m => [...m, errorMsg]);
    } finally {
      this.isTyping.set(false);
    }
  }

  getInitialThoughts() {
    return [
      "He stayed too long today. He's planning something.",
      "Tommy said I was lucky to have him. He was right about the worthlessness, at least.",
      "Nate smiles like he means it. That's the most dangerous part.",
      "If I don't care, it won't hurt when they leave.",
      "Love is just a slow-motion car crash."
    ];
  }
}
