# Navbar Test Plan

Comprehensive test plan for the Quran.com navbar system, including banner, context menu, drawers,
and related components.

**Related Documentation:** [NAVBAR-ARCHITECTURE.md](./NAVBAR-ARCHITECTURE.md)

---

## Test Environment Setup

### Devices to Test

| Device        | Viewport                    | Priority |
| ------------- | --------------------------- | -------- |
| Desktop       | 1440x900                    | P0       |
| Desktop Large | 1920x1080                   | P1       |
| Tablet        | 768x1024                    | P0       |
| Mobile        | 375x667 (iPhone SE)         | P0       |
| Mobile Small  | 320x568                     | P1       |
| Mobile Large  | 428x926 (iPhone 14 Pro Max) | P1       |

### Browsers to Test

| Browser          | Priority |
| ---------------- | -------- |
| Chrome (latest)  | P0       |
| Safari (latest)  | P0       |
| Firefox (latest) | P1       |
| Safari iOS       | P0       |
| Chrome Android   | P1       |

---

## Phase 1: Smoke Tests (P0 - Must Pass)

Execute these first. If any fail, stop and report.

### ST-01: Context Menu Not Covered (Desktop)

| Step | Action                              | Expected                                         | Pass |
| ---- | ----------------------------------- | ------------------------------------------------ | ---- |
| 1    | Open browser at 1440x900            | Browser opens                                    | [x]  |
| 2    | Navigate to `/1`                    | Al-Fatihah page loads                            | [x]  |
| 3    | Verify navbar visible               | Navbar at top with banner centered               | [x]  |
| 4    | Verify context menu visible         | Context menu below navbar, shows "1. Al-Fatihah" | [x]  |
| 5    | Scroll down 200px                   | Navbar hides (slides up)                         | [x]  |
| 6    | Scroll up 10px                      | Navbar reappears                                 | [x]  |
| 7    | **Verify context menu NOT covered** | Context menu fully visible below navbar          | [x]  |

**Result:** [x] PASS / [ ] FAIL **Notes:** **\*\***\_\_\_**\*\***

---

### ST-02: Context Menu Not Covered (Mobile with Banner)

| Step | Action                              | Expected                               | Pass |
| ---- | ----------------------------------- | -------------------------------------- | ---- |
| 1    | Open browser at 375x667             | Browser opens                          | [x]  |
| 2    | Navigate to `/1`                    | Al-Fatihah page loads                  | [x]  |
| 3    | Verify banner above navbar          | Banner shows at very top               | [x]  |
| 4    | Verify context menu position        | Context menu below navbar+banner       | [x]  |
| 5    | Scroll down 200px                   | Navbar+banner hide together            | [x]  |
| 6    | Scroll up 10px                      | Navbar+banner reappear                 | [x]  |
| 7    | **Verify context menu NOT covered** | Context menu fully visible, no overlap | [x]  |

**Result:** [x] PASS / [ ] FAIL **Notes:** **\*\***\_\_\_**\*\***

---

### ST-03: Banner Dimmed When Drawer Opens (Mobile)

| Step | Action                      | Expected                        | Pass |
| ---- | --------------------------- | ------------------------------- | ---- |
| 1    | Open browser at 375x667     | Browser opens                   | [x]  |
| 2    | Navigate to `/1`            | Page loads with banner visible  | [x]  |
| 3    | Click hamburger menu (☰)    | Navigation drawer opens         | [x]  |
| 4    | **Verify banner is dimmed** | Dark overlay covers banner      | [x]  |
| 5    | Verify navbar items dimmed  | Dark overlay covers navbar      | [x]  |
| 6    | Click outside drawer        | Drawer closes                   | [x]  |
| 7    | Verify overlay removed      | Banner and navbar fully visible | [x]  |

**Result:** [x] PASS / [ ] FAIL **Notes:** **\*\***\_\_\_**\*\***

---

### ST-04: Resize Desktop to Mobile

| Step | Action                          | Expected                         | Pass |
| ---- | ------------------------------- | -------------------------------- | ---- |
| 1    | Open browser at 1440x900        | Browser opens                    | [x]  |
| 2    | Navigate to `/1`                | Page loads                       | [x]  |
| 3    | Note banner position            | Banner centered in navbar        | [x]  |
| 4    | Resize window to 375px width    | Layout adjusts                   | [x]  |
| 5    | **Verify banner moved to top**  | Banner now above navbar          | [x]  |
| 6    | Verify context menu position    | Below navbar+banner, no overlap  | [x]  |
| 7    | Verify MobileReadingTabs appear | Translation/Reading tabs visible | [x]  |

**Result:** [x] PASS / [ ] FAIL **Notes:** **\*\***\_\_\_**\*\***

---

### ST-05: Tajweed Bar with Banner

| Step | Action                           | Expected                                      | Pass |
| ---- | -------------------------------- | --------------------------------------------- | ---- |
| 1    | Open browser at 375x667          | Browser opens                                 | [x]  |
| 2    | Navigate to `/1`                 | Page loads                                    | [x]  |
| 3    | Open settings drawer (gear icon) | Settings panel opens                          | [x]  |
| 4    | Change Quran font to "Tajweed"   | Font setting updated                          | [x]  |
| 5    | Close settings drawer            | Drawer closes                                 | [x]  |
| 6    | **Verify Tajweed bar appears**   | Collapsible bar below context menu            | [x]  |
| 7    | Click "Tajweed Colors" toggle    | Color legend expands                          | [x]  |
| 8    | Scroll down then up              | All elements animate correctly                | [x]  |
| 9    | Verify no overlapping            | Tajweed bar, context menu, banner all visible | [x]  |

**Result:** [x] PASS / [ ] FAIL **Notes:** **\*\***\_\_\_**\*\***

---

## Phase 2: Banner Behavior Tests

### BN-01: Banner Position Desktop

| Step | Action                              | Expected                      | Pass |
| ---- | ----------------------------------- | ----------------------------- | ---- |
| 1    | Desktop 1440x900, navigate to `/2`  | Page loads                    | [x]  |
| 2    | Inspect navbar height               | Should be 3.6rem (57.6px)     | [x]  |
| 3    | Verify banner centered horizontally | Banner in middle of navbar    | [x]  |
| 4    | Verify banner CTA clickable         | "Create My Goal" button works | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### BN-02: Banner Position Mobile

| Step | Action                           | Expected                            | Pass |
| ---- | -------------------------------- | ----------------------------------- | ---- |
| 1    | Mobile 375x667, navigate to `/2` | Page loads                          | [x]  |
| 2    | Verify banner above navbar       | Separate row at very top            | [x]  |
| 3    | Inspect total height             | Should be ~6.6rem (navbar + banner) | [x]  |
| 4    | Verify banner CTA clickable      | Button navigates correctly          | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### BN-03: Banner on Very Small Screen

| Step | Action                                      | Expected        | Pass |
| ---- | ------------------------------------------- | --------------- | ---- |
| 1    | Set viewport to 320x568                     | Smallest mobile | [x]  |
| 2    | Navigate to `/1`                            | Page loads      | [x]  |
| 3    | Verify no horizontal scroll                 | Content fits    | [x]  |
| 4    | Verify banner text wraps/truncates properly | Readable        | [x]  |
| 5    | Verify CTA still clickable                  | Button works    | [x]  |

**Result:** [x] PASS / [ ] FAIL **Notes: the horizontal scroll appears, not because the navbar, but
because of the translation selection button**

---

## Phase 3: Scroll Behavior Tests

### SC-01: Scroll Down Desktop

| Step | Action                             | Expected               | Pass |
| ---- | ---------------------------------- | ---------------------- | ---- |
| 1    | Desktop 1440x900, navigate to `/2` | Page loads             | [x]  |
| 2    | Scroll down 50px                   | Nothing changes yet    | [x]  |
| 3    | Scroll down 100px more             | Navbar starts hiding   | [x]  |
| 4    | Verify smooth animation            | CSS transition visible | [x]  |
| 5    | Context menu stays visible         | Full info displayed    | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### SC-02: Scroll Down Mobile

| Step | Action                           | Expected                | Pass |
| ---- | -------------------------------- | ----------------------- | ---- |
| 1    | Mobile 375x667, navigate to `/2` | Page loads              | [x]  |
| 2    | Scroll down 100px                | Navbar+banner hide      | [x]  |
| 3    | Verify context menu collapses    | Shows minimal info only | [x]  |
| 4    | Verify MobileReadingTabs hidden  | Tabs disappear          | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### SC-03: Scroll Up Recovery

| Step | Action                                    | Expected                   | Pass |
| ---- | ----------------------------------------- | -------------------------- | ---- |
| 1    | Start from scrolled state (navbar hidden) | Navbar not visible         | [x]  |
| 2    | Scroll up 10px                            | Navbar starts appearing    | [x]  |
| 3    | Verify navbar fully visible               | Complete navbar shown      | [x]  |
| 4    | Verify banner visible                     | Banner in correct position | [x]  |
| 5    | Verify context menu expanded              | Full info displayed        | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### SC-04: Rapid Scroll (No Flickering)

| Step | Action                     | Expected                            | Pass |
| ---- | -------------------------- | ----------------------------------- | ---- |
| 1    | Navigate to `/2`           | Page loads                          | [x]  |
| 2    | Rapidly scroll up and down | Fast alternating scroll             | [x]  |
| 3    | Verify no flickering       | Smooth transitions (150ms debounce) | [x]  |
| 4    | Verify final state correct | Matches scroll direction            | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

## Phase 4: Drawer Interaction Tests

### DR-01: Navigation Drawer Dimming

| Step | Action                       | Expected                 | Pass |
| ---- | ---------------------------- | ------------------------ | ---- |
| 1    | Navigate to `/1`             | Page loads               | [x]  |
| 2    | Click hamburger menu         | Drawer opens from left   | [x]  |
| 3    | Verify navbar items dimmed   | Dark overlay visible     | [x]  |
| 4    | Verify content dimmed        | Page content has overlay | [x]  |
| 5    | Mobile: Verify banner dimmed | Banner has overlay       | [x]  |
| 6    | Click overlay to close       | Drawer closes            | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### DR-02: Search Drawer

| Step | Action            | Expected            | Pass |
| ---- | ----------------- | ------------------- | ---- |
| 1    | Navigate to `/1`  | Page loads          | [x]  |
| 2    | Click search icon | Search drawer opens | [x]  |
| 3    | Type "rahman"     | Results appear      | [x]  |
| 4    | Click a result    | Navigates correctly | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### DR-03: Settings Drawer

| Step | Action                       | Expected                  | Pass |
| ---- | ---------------------------- | ------------------------- | ---- |
| 1    | Navigate to `/1`             | Page loads                | [x]  |
| 2    | Click settings/gear icon     | Settings drawer opens     | [x]  |
| 3    | Change theme to Dark         | Theme applies immediately | [x]  |
| 4    | Verify navbar colors updated | Dark theme colors         | [x]  |
| 5    | Change theme back to Light   | Theme reverts             | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

## Phase 5: Context Menu Tests

### CM-01: Context Menu Content

| Step | Action              | Expected                        | Pass |
| ---- | ------------------- | ------------------------------- | ---- |
| 1    | Navigate to `/76`   | Al-Insan page loads             | [x]  |
| 2    | Verify chapter name | "76. Al-Insan" displayed        | [x]  |
| 3    | Verify page info    | "Juz 29", "Hizb 58", "Page 578" | [x]  |
| 4    | Verify progress bar | Shows reading progress          | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### CM-02: Context Menu on Different Routes

| Route       | Chapter Info         | Page Info      | Pass |
| ----------- | -------------------- | -------------- | ---- |
| `/1`        | 1. Al-Fatihah        | Juz 1, Page 1  | [x]  |
| `/2/255`    | 2. Al-Baqarah        | Juz 3, Page 42 | [x]  |
| `/page/300` | Correct chapter      | Page 300       | [x]  |
| `/juz/15`   | First chapter in juz | Juz 15         | [x]  |
| `/hizb/30`  | Correct chapter      | Hizb 30        | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### CM-03: Mobile Reading Tabs

| Step | Action                           | Expected                       | Pass |
| ---- | -------------------------------- | ------------------------------ | ---- |
| 1    | Mobile 375x667, navigate to `/1` | Page loads                     | [x]  |
| 2    | Verify tabs visible              | Translation/Reading tabs shown | [x]  |
| 3    | Current tab highlighted          | Translation tab active         | [x]  |
| 4    | Click "Reading" tab              | View switches to reading mode  | [x]  |
| 5    | Verify URL updated               | Query params may change        | [x]  |
| 6    | Scroll down                      | Tabs disappear                 | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

## Phase 6: Sidebar Tests

### SB-01: Sidebar Navigation Position

| Step | Action                             | Expected                    | Pass |
| ---- | ---------------------------------- | --------------------------- | ---- |
| 1    | Desktop, navigate to `/1`          | Page loads                  | [x]  |
| 2    | Click chapter name in context menu | Sidebar opens               | [x]  |
| 3    | Verify sidebar position            | Below navbar + context menu | [x]  |
| 4    | With banner visible                | Accounts for banner height  | [x]  |
| 5    | Scroll down (navbar hides)         | Sidebar adjusts position    | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### SB-02: Notes Sidebar

| Step | Action                    | Expected                   | Pass |
| ---- | ------------------------- | -------------------------- | ---- |
| 1    | Navigate to `/1`          | Page loads                 | [x]  |
| 2    | Open notes sidebar        | Slides in from right       | [x]  |
| 3    | Verify top padding        | Accounts for navbar height | [x]  |
| 4    | With banner visible       | Accounts for banner        | [x]  |
| 5    | Verify context menu width | Adjusts for sidebar        | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

## Phase 7: Tajweed Bar Tests

### TJ-01: Tajweed Bar Visibility

| Step | Action                             | Expected                | Pass |
| ---- | ---------------------------------- | ----------------------- | ---- |
| 1    | Navigate to `/1` with default font | Page loads              | [x]  |
| 2    | Verify NO Tajweed bar              | Bar not visible         | [x]  |
| 3    | Open settings, select Tajweed font | Setting applied         | [x]  |
| 4    | Verify Tajweed bar appears         | Collapsible bar visible | [x]  |
| 5    | Click toggle to expand             | Color legend shows      | [x]  |
| 6    | Click toggle to collapse           | Color legend hides      | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### TJ-02: Tajweed Bar with Scroll

| Step | Action                      | Expected                            | Pass |
| ---- | --------------------------- | ----------------------------------- | ---- |
| 1    | Enable Tajweed font         | Tajweed bar visible                 | [x]  |
| 2    | Scroll down                 | Navbar hides                        | [x]  |
| 3    | Verify Tajweed bar behavior | Animates with context menu          | [x]  |
| 4    | Scroll up                   | Everything reappears                | [x]  |
| 5    | Verify stacking order       | Banner > Navbar > Context > Tajweed | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

## Phase 8: RTL Tests

### RTL-01: Arabic Language Layout

| Step | Action                    | Expected                    | Pass |
| ---- | ------------------------- | --------------------------- | ---- |
| 1    | Change language to Arabic | Site in RTL mode            | [x]  |
| 2    | Navigate to `/1`          | Page loads                  | [x]  |
| 3    | Verify navbar layout      | Logo on right, menu on left | [x]  |
| 4    | Verify banner position    | Correct alignment           | [x]  |
| 5    | Open navigation drawer    | Opens from right            | [x]  |
| 6    | Verify sidebar navigation | Correct positioning         | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

## Phase 9: Edge Cases

### EC-01: iOS Overscroll

| Step | Action                           | Expected               | Pass |
| ---- | -------------------------------- | ---------------------- | ---- |
| 1    | Open on iOS Safari               | Page loads             | [ ]  |
| 2    | Pull down past top (rubber band) | Overscroll effect      | [ ]  |
| 3    | Release                          | Page returns to normal | [ ]  |
| 4    | Verify navbar did NOT hide       | Still visible          | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### EC-02: Tab Switch Lock

| Step | Action                       | Expected                        | Pass |
| ---- | ---------------------------- | ------------------------------- | ---- |
| 1    | Mobile, navigate to `/1`     | Page loads                      | [x]  |
| 2    | Click "Reading" tab          | Switching modes                 | [x]  |
| 3    | During switch, try scrolling | Scroll should work              | [x]  |
| 4    | Verify no navbar flicker     | Visibility locked during switch | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

### EC-03: Non-Reader Routes

| Step | Action                       | Expected                | Pass |
| ---- | ---------------------------- | ----------------------- | ---- |
| 1    | Navigate to `/` (homepage)   | Page loads              | [x]  |
| 2    | Verify NO context menu       | Not rendered            | [x]  |
| 3    | Verify navbar works normally | Scroll behavior correct | [x]  |
| 4    | Navigate to `/search`        | Search page loads       | [x]  |
| 5    | Verify NO context menu       | Not rendered            | [x]  |

**Result:** [x] PASS / [ ] FAIL

---

## Test Results Summary

| Phase                 | Tests  | Passed | Failed | Blocked |
| --------------------- | ------ | ------ | ------ | ------- |
| Phase 1: Smoke        | 5      | 5      | 0      | 0       |
| Phase 2: Banner       | 3      | 3      | 0      | 0       |
| Phase 3: Scroll       | 4      | 4      | 0      | 0       |
| Phase 4: Drawer       | 3      | 3      | 0      | 0       |
| Phase 5: Context Menu | 3      | 3      | 0      | 0       |
| Phase 6: Sidebar      | 2      | 2      | 0      | 0       |
| Phase 7: Tajweed      | 2      | 2      | 0      | 0       |
| Phase 8: RTL          | 1      | 1      | 0      | 0       |
| Phase 9: Edge Cases   | 3      | 2      | 0      | 1       |
| **TOTAL**             | **26** | **25** | **0**  | **1**   |

---

## Sign-Off

| Role      | Name                       | Date       | Signature |
| --------- | -------------------------- | ---------- | --------- |
| Tester    |                            |            |           |
| Developer | Muhammad Afifudin Abdullah | 2025-12-15 | [x]       |
| Reviewer  |                            |            |           |

---

## Notes

_Additional observations during testing:_

---

---

---

---

## Defects Found

| ID      | Description                                                                                                | Severity | Steps to Reproduce                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| DEF-001 | Horizontal scroll appears on 320x568 viewport - caused by translation selection button, not navbar itself. | Low      | 1. Set viewport to 320x568<br>2. Navigate to `/1`<br>3. Observe horizontal scroll present<br>4. Inspect: translation button too wide |
