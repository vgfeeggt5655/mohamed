import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { GithubService } from './services/github.service';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class AppComponent {
  private readonly githubService = inject(GithubService);
  private readonly geminiService = inject(GeminiService);

  username = signal('angular');
  userData = signal<any | null>(null);
  userRepos = signal<any[]>([]);
  error = signal<string | null>(null);
  loading = signal(false);
  
  geminiSummary = signal<string | null>(null);
  geminiLoading = signal(false);

  constructor() {
    this.searchUser(); // Initial search on load
  }

  searchUser(): void {
    if (!this.username() || this.username().trim() === '') {
      this.error.set('الرجاء إدخال اسم مستخدم GitHub.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.userData.set(null);
    this.userRepos.set([]);
    this.geminiSummary.set(null);

    const userRequest = this.githubService.getUser(this.username());
    const reposRequest = this.githubService.getRepos(this.username());

    forkJoin([userRequest, reposRequest]).pipe(
      catchError(err => {
        this.error.set(err.message || 'An unexpected error occurred.');
        return of([null, null]); // return a stream that completes
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(([user, repos]) => {
      if (user && repos) {
        this.userData.set(user);
        this.userRepos.set(repos);
      }
    });
  }

  async generateSummary(): Promise<void> {
    if (!this.userData()) return;

    this.geminiLoading.set(true);
    this.geminiSummary.set(null);
    
    try {
      const summary = await this.geminiService.generateBioSummary(this.userData(), this.userRepos());
      this.geminiSummary.set(summary);
    } catch (e) {
      this.geminiSummary.set('فشل إنشاء الملخص.');
    } finally {
      this.geminiLoading.set(false);
    }
  }

  formatDate(dateStr: string): string {
    return formatDate(dateStr, 'mediumDate', 'en-US');
  }
}