
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly GITHUB_API_URL = 'https://api.github.com/users';

  getUser(username: string): Observable<any> {
    return this.http.get(`${this.GITHUB_API_URL}/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  getRepos(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.GITHUB_API_URL}/${username}/repos?per_page=6&sort=updated`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.status === 404) {
      errorMessage = `User not found. Please check the username and try again.`;
    } else if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
