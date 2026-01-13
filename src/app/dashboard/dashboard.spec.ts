import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { MovieService, ProducerInterval, Studio, YearWithMultipleWinners, MovieWinner } from '../services/movie.service';

describe(Dashboard.name, () => {
  let fixture: any;
  let component: Dashboard;
  let movieServiceMock: {
    getYearsWithMultipleWinners: ReturnType<typeof vi.fn>;
    getStudiosWithWinCount: ReturnType<typeof vi.fn>;
    getProducersIntervals: ReturnType<typeof vi.fn>;
    getMovieWinnersByYear: ReturnType<typeof vi.fn>;
  };

  const sampleYears: YearWithMultipleWinners[] = [
    { year: 1980, winnerCount: 2 },
    { year: 1990, winnerCount: 3 },
  ];

  const sampleStudios: Studio[] = [
    { name: 'Studio A', winCount: 10 },
    { name: 'Studio B', winCount: 8 },
    { name: 'Studio C', winCount: 6 },
    { name: 'Studio D', winCount: 4 },
  ];

  const sampleMaxIntervals: ProducerInterval[] = [
    { producer: 'Max P', interval: 10, previousWin: 1980, followingWin: 1990 },
  ];

  const sampleMinIntervals: ProducerInterval[] = [
    { producer: 'Min P', interval: 1, previousWin: 1989, followingWin: 1990 },
  ];

  const sampleWinners: MovieWinner[] = [
    { id: 1, year: 2000, title: 'Winner 1' },
    { id: 2, year: 2000, title: 'Winner 2' },
  ];

  beforeEach(async () => {
    movieServiceMock = {
      getYearsWithMultipleWinners: vi.fn(() => of({ years: sampleYears })),
      getStudiosWithWinCount: vi.fn(() => of({ studios: sampleStudios })),
      getProducersIntervals: vi.fn(() => of({ max: sampleMaxIntervals, min: sampleMinIntervals })),
      getMovieWinnersByYear: vi.fn(() => of(sampleWinners)),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: MovieService, useValue: movieServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init and set signals', () => {
    fixture.detectChanges();

    expect(movieServiceMock.getYearsWithMultipleWinners).toHaveBeenCalledTimes(1);
    expect(movieServiceMock.getStudiosWithWinCount).toHaveBeenCalledTimes(1);
    expect(movieServiceMock.getProducersIntervals).toHaveBeenCalledTimes(1);

    expect(component.multipleWinnersYears()).toEqual(sampleYears);

    expect(component.topStudios().length).toBe(3);
    expect(component.topStudios()).toEqual(sampleStudios.slice(0, 3));

    expect(component.maxIntervalProducers()).toEqual(sampleMaxIntervals);
    expect(component.minIntervalProducers()).toEqual(sampleMinIntervals);
  });

  it('should reset search state when no year is provided', () => {
    component.searchYear = null;
    component.searchMoviesByYear();

    expect(component.searchPerformed()).toBe(false);
    expect(component.searchResults()).toEqual([]);
    expect(movieServiceMock.getMovieWinnersByYear).not.toHaveBeenCalled();
  });

  it('should search winners by year and set results', () => {
    component.searchYear = 2000;
    movieServiceMock.getMovieWinnersByYear.mockReturnValue(of(sampleWinners));

    component.searchMoviesByYear();

    expect(movieServiceMock.getMovieWinnersByYear).toHaveBeenCalledWith(2000);
    expect(component.searchPerformed()).toBe(true);
    expect(component.searchResults()).toEqual(sampleWinners);
  });

});
