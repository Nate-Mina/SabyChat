import { ChangeDetectionStrategy, Component, signal, inject, effect, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CharacterService } from './character';
import { animate, stagger } from "motion";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  private character = inject(CharacterService);
  
  messages = this.character.currentMessages;
  isTyping = this.character.isTyping;
  initialThoughts = this.character.getInitialThoughts();
  
  userInput = signal('');
  activeTab = signal<'chat' | 'shadow'>('chat');
  
  chatScrollContainer = viewChild<ElementRef>('chatScroll');

  constructor() {
    effect(() => {
      // Auto-scroll chat
      this.messages();
      const container = this.chatScrollContainer();
      if (container) {
        setTimeout(() => {
          container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
        }, 100);
      }
    });
  }

  ngAfterViewInit() {
    // Entrance animations
    animate(
      ".shard",
      { opacity: [0, 0.6], scale: [0.8, 1] },
      { delay: stagger(0.2), duration: 1.5, ease: "easeOut" }
    );
  }

  async send() {
    const text = this.userInput().trim();
    if (!text) return;
    
    this.userInput.set('');
    await this.character.sendMessage(text);
  }
}
