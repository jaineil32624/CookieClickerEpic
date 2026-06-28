#include <SDL2/SDL.h>
#include <SDL2/SDL_ttf.h>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using namespace std;

struct Upgrade {
    string name;
    int cost;
    int cookiesPerClick;
    double autoCookiesPerSecond;
};

int main() {
    if (SDL_Init(SDL_INIT_VIDEO) != 0) {
        cerr << "SDL_Init failed: " << SDL_GetError() << endl;
        return 1;
    }

    if (TTF_Init() != 0) {
        cerr << "TTF_Init failed: " << TTF_GetError() << endl;
        SDL_Quit();
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow(
        "Cookie Clicker",
        SDL_WINDOWPOS_CENTERED,
        SDL_WINDOWPOS_CENTERED,
        900,
        600,
        SDL_WINDOW_SHOWN
    );
    if (!window) {
        cerr << "SDL_CreateWindow failed: " << SDL_GetError() << endl;
        TTF_Quit();
        SDL_Quit();
        return 1;
    }

    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (!renderer) {
        cerr << "SDL_CreateRenderer failed: " << SDL_GetError() << endl;
        SDL_DestroyWindow(window);
        TTF_Quit();
        SDL_Quit();
        return 1;
    }

    TTF_Font* font = TTF_OpenFont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24);
    if (!font) {
        cerr << "TTF_OpenFont failed: " << TTF_GetError() << endl;
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        TTF_Quit();
        SDL_Quit();
        return 1;
    }

    long double cookies = 0;
    int clicksPerClick = 1;
    double autoCookiesPerSecond = 0.0;
    vector<Upgrade> upgrades = {
        {"Cursor", 15, 1, 0.0},
        {"Grandma", 100, 2, 0.1},
        {"Farm", 500, 5, 0.5},
        {"Mine", 1200, 10, 1.0},
        {"Factory", 3000, 20, 2.0},
        {"Bank", 7000, 50, 4.0},
        {"Temple", 15000, 100, 8.0},
        {"Wizard", 30000, 200, 15.0},
        {"Ship", 60000, 500, 30.0},
        {"Portal", 100000, 1000, 60.0},
    };
    vector<int> owned(upgrades.size(), 0);

    bool running = true;
    Uint32 lastTicks = SDL_GetTicks();

    auto renderText = [&](const string& text, int x, int y, SDL_Color color) {
        SDL_Surface* surface = TTF_RenderText_Solid(font, text.c_str(), color);
        if (!surface) return;
        SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surface);
        if (texture) {
            SDL_Rect dst = {x, y, surface->w, surface->h};
            SDL_RenderCopy(renderer, texture, nullptr, &dst);
            SDL_DestroyTexture(texture);
        }
        SDL_FreeSurface(surface);
    };

    while (running) {
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) {
                running = false;
            } else if (event.type == SDL_MOUSEBUTTONDOWN) {
                int mouseX = event.button.x;
                int mouseY = event.button.y;

                if (mouseX >= 300 && mouseX <= 600 && mouseY >= 140 && mouseY <= 440) {
                    cookies += clicksPerClick;
                }

                for (size_t i = 0; i < upgrades.size(); ++i) {
                    int y = 485 + static_cast<int>(i / 2) * 25;
                    int x = 30 + static_cast<int>(i % 2) * 400;
                    SDL_Rect box = {x, y, 360, 20};
                    if (mouseX >= box.x && mouseX <= box.x + box.w && mouseY >= box.y && mouseY <= box.y + box.h) {
                        if (cookies >= upgrades[i].cost) {
                            cookies -= upgrades[i].cost;
                            clicksPerClick += upgrades[i].cookiesPerClick;
                            autoCookiesPerSecond += upgrades[i].autoCookiesPerSecond;
                            owned[i]++;
                        }
                    }
                }
            } else if (event.type == SDL_KEYDOWN) {
                if (event.key.keysym.sym == SDLK_ESCAPE) {
                    running = false;
                }
            }
        }

        Uint32 now = SDL_GetTicks();
        double elapsed = (now - lastTicks) / 1000.0;
        lastTicks = now;
        cookies += autoCookiesPerSecond * elapsed;

        SDL_SetRenderDrawColor(renderer, 20, 20, 40, 255);
        SDL_RenderClear(renderer);

        SDL_SetRenderDrawColor(renderer, 255, 215, 0, 255);
        SDL_Rect cookieButton = {300, 140, 300, 300};
        SDL_RenderFillRect(renderer, &cookieButton);

        SDL_SetRenderDrawColor(renderer, 50, 30, 10, 255);
        SDL_Rect cookieCenter = {360, 210, 180, 160};
        SDL_RenderFillRect(renderer, &cookieCenter);

        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
        SDL_Rect panel = {20, 20, 860, 120};
        SDL_RenderFillRect(renderer, &panel);

        stringstream ss;
        ss << "Cookies: " << static_cast<long long>(cookies);
        renderText(ss.str(), 30, 35, {20, 20, 20, 255});
        ss.str("");
        ss << "Per click: " << clicksPerClick;
        renderText(ss.str(), 30, 65, {20, 20, 20, 255});
        ss.str("");
        ss << "Auto/sec: " << autoCookiesPerSecond;
        renderText(ss.str(), 30, 95, {20, 20, 20, 255});

        renderText("Click the cookie!", 340, 470, {255, 255, 255, 255});

        SDL_Rect upgradePanel = {20, 470, 860, 110};
        SDL_SetRenderDrawColor(renderer, 40, 40, 60, 255);
        SDL_RenderFillRect(renderer, &upgradePanel);

        for (size_t i = 0; i < upgrades.size(); ++i) {
            int y = 485 + static_cast<int>(i / 2) * 25;
            int x = 30 + static_cast<int>(i % 2) * 400;
            if (cookies >= upgrades[i].cost) {
                SDL_SetRenderDrawColor(renderer, 100, 220, 120, 255);
            } else {
                SDL_SetRenderDrawColor(renderer, 220, 220, 220, 255);
            }
            SDL_Rect box = {x, y, 360, 20};
            SDL_RenderFillRect(renderer, &box);
            stringstream upgradeText;
            upgradeText << upgrades[i].name << " - Cost " << upgrades[i].cost;
            renderText(upgradeText.str(), x + 5, y - 2, {0, 0, 0, 255});
        }

        SDL_RenderPresent(renderer);
        SDL_Delay(16);
    }

    TTF_CloseFont(font);
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    TTF_Quit();
    SDL_Quit();
    return 0;
}
