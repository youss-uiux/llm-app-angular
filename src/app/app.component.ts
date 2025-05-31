import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  textForm: FormGroup;
  output: string = '';
  loading: boolean = false;

  // Adresse de ton backend FastAPI local
  private readonly API_URL = 'http://localhost:8000/analyze';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.textForm = this.fb.group({
      inputText: ['', Validators.required],
      mode: ['summarize', Validators.required]
    });
  }

  async processText(): Promise<void> {
    if (this.textForm.invalid) return;

    const { inputText, mode } = this.textForm.value;
    this.loading = true;
    this.output = '';

    const body = {
      text: inputText,
      mode: mode
    };

    try {
      const response = await this.http.post<{ result: any }>(this.API_URL, body).toPromise();

      // Si le mode est "sentiment", on suppose un objet avec "label" et "score"
      if (mode === 'sentiment' && typeof response?.result === 'object') {
        this.output = `😊 Sentiment détecté : ${response.result.label} (score : ${(response.result.score * 100).toFixed(1)}%)`;
      } else {
        // Pour un résumé ou tout autre texte simple
        this.output = response?.result || 'Aucun résultat trouvé.';
      }

    } catch (error: any) {
      console.error('Erreur API:', error);
      this.output = '❌ Une erreur est survenue. Vérifie si FastAPI est bien lancé.';
    } finally {
      this.loading = false;
    }
  }

  resetOutput(): void {
    this.output = '';
  }
}
