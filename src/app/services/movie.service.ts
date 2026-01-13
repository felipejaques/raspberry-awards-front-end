import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface YearWithMultipleWinners {
  year: number;
  winnerCount: number;
}

export interface Studio {
  name: string;
  winCount: number;
}

export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface MovieWinner {
  id: number;
  year: number;
  title: string;
}

export interface Movie {
  id: number;
  year: number;
  title: string;
  studios: string[];
  producers: string[];
  winner: boolean;
}

export interface MoviesPageResponse {
  content: Movie[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  number: number;
  size: number;
}

interface YearsWithMultipleWinnersResponse {
  years: YearWithMultipleWinners[];
}

interface StudiosResponse {
  studios: Studio[];
}

interface ProducersIntervalsResponse {
  min: ProducerInterval[];
  max: ProducerInterval[];
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly apiBaseUrl = 'https://challenge.outsera.tech/api/movies';

  constructor(private http: HttpClient) {}

  public getYearsWithMultipleWinners(): Observable<YearsWithMultipleWinnersResponse> {
    return this.http.get<YearsWithMultipleWinnersResponse>(
      `${this.apiBaseUrl}/yearsWithMultipleWinners`
    );
  }

  public getStudiosWithWinCount(): Observable<StudiosResponse> {
    return this.http.get<StudiosResponse>(
      `${this.apiBaseUrl}/studiosWithWinCount`
    );
  }

  public getProducersIntervals(): Observable<ProducersIntervalsResponse> {
    return this.http.get<ProducersIntervalsResponse>(
      `${this.apiBaseUrl}/maxMinWinIntervalForProducers`
    );
  }

  public getMovieWinnersByYear(year: number): Observable<MovieWinner[]> {
    return this.http.get<MovieWinner[]>(
      `${this.apiBaseUrl}?page=9&size=99&winner=true&year=${year}`
    );
  }

  public getMovies(page: number = 0, size: number = 15, year?: number, winner?: boolean): Observable<MoviesPageResponse> {
    let params = `page=${page}&size=${size}`;
    
    if (year !== undefined && year !== null) {
      params += `&year=${year}`;
    }
    
    if (winner !== undefined && winner !== null) {
      params += `&winner=${winner}`;
    }
    
    return this.http.get<MoviesPageResponse>(`${this.apiBaseUrl}?${params}`);
  }
}
