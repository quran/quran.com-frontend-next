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
| 1    | Open browser at 1440x900            | Browser opens                                    | [ ]  |
| 2    | Navigate to `/1`                    | Al-Fatihah page loads                            | [ ]  |
| 3    | Verify navbar visible               | Navbar at top with banner centered               | [ ]  |
| 4    | Verify context menu visible         | Context menu below navbar, shows "1. Al-Fatihah" | [ ]  |
| 5    | Scroll down 200px                   | Navbar hides (slides up)                         | [ ]  |
| 6    | Scroll up 10px                      | Navbar reappears                                 | [ ]  |
| 7    | **Verify context menu NOT covered** | Context menu fully visible below navbar          | [ ]  |

**Result:** [ ] PASS / [ ] FAIL **Notes:** ******\_\_\_******

---

### ST-02: Context Menu Not Covered (Mobile with Banner)

| Step | Action                              | Expected                               | Pass |
| ---- | ----------------------------------- | -------------------------------------- | ---- |
| 1    | Open browser at 375x667             | Browser opens                          | [ ]  |
| 2    | Navigate to `/1`                    | Al-Fatihah page loads                  | [ ]  |
| 3    | Verify banner above navbar          | Banner shows at very top               | [ ]  |
| 4    | Verify context menu position        | Context menu below navbar+banner       | [ ]  |
| 5    | Scroll down 200px                   | Navbar+banner hide together            | [ ]  |
| 6    | Scroll up 10px                      | Navbar+banner reappear                 | [ ]  |
| 7    | **Verify context menu NOT covered** | Context menu fully visible, no overlap | [ ]  |

**Result:** [ ] PASS / [ ] FAIL **Notes:** ******\_\_\_******

---

### ST-03: Banner Dimmed When Drawer Opens (Mobile)

| Step | Action                      | Expected                        | Pass |
| ---- | --------------------------- | ------------------------------- | ---- |
| 1    | Open browser at 375x667     | Browser opens                   | [ ]  |
| 2    | Navigate to `/1`            | Page loads with banner visible  | [ ]  |
| 3    | Click hamburger menu (☰)    | Navigation drawer opens         | [ ]  |
| 4    | **Verify banner is dimmed** | Dark overlay covers banner      | [ ]  |
| 5    | Verify navbar items dimmed  | Dark overlay covers navbar      | [ ]  |
| 6    | Click outside drawer        | Drawer closes                   | [ ]  |
| 7    | Verify overlay removed      | Banner and navbar fully visible | [ ]  |

**Result:** [ ] PASS / [ ] FAIL **Notes:** ******\_\_\_******

---

### ST-04: Resize Desktop to Mobile

| Step | Action                          | Expected                         | Pass |
| ---- | ------------------------------- | -------------------------------- | ---- |
| 1    | Open browser at 1440x900        | Browser opens                    | [ ]  |
| 2    | Navigate to `/1`                | Page loads                       | [ ]  |
| 3    | Note banner position            | Banner centered in navbar        | [ ]  |
| 4    | Resize window to 375px width    | Layout adjusts                   | [ ]  |
| 5    | **Verify banner moved to top**  | Banner now above navbar          | [ ]  |
| 6    | Verify context menu position    | Below navbar+banner, no overlap  | [ ]  |
| 7    | Verify MobileReadingTabs appear | Translation/Reading tabs visible | [ ]  |

**Result:** [ ] PASS / [ ] FAIL **Notes:** ******\_\_\_******

---

### ST-05: Tajweed Bar with Banner

| Step | Action                           | Expected                                      | Pass |
| ---- | -------------------------------- | --------------------------------------------- | ---- |
| 1    | Open browser at 375x667          | Browser opens                                 | [ ]  |
| 2    | Navigate to `/1`                 | Page loads                                    | [ ]  |
| 3    | Open settings drawer (gear icon) | Settings panel opens                          | [ ]  |
| 4    | Change Quran font to "Tajweed"   | Font setting updated                          | [ ]  |
| 5    | Close settings drawer            | Drawer closes                                 | [ ]  |
| 6    | **Verify Tajweed bar appears**   | Collapsible bar below context menu            | [ ]  |
| 7    | Click "Tajweed Colors" toggle    | Color legend expands                          | [ ]  |
| 8    | Scroll down then up              | All elements animate correctly                | [ ]  |
| 9    | Verify no overlapping            | Tajweed bar, context menu, banner all visible | [ ]  |

**Result:** [ ] PASS / [ ] FAIL **Notes:** ******\_\_\_******

---

## Phase 2: Banner Behavior Tests

### BN-01: Banner Position Desktop

| Step | Action                              | Expected                      | Pass |
| ---- | ----------------------------------- | ----------------------------- | ---- |
| 1    | Desktop 1440x900, navigate to `/2`  | Page loads                    | [ ]  |
| 2    | Inspect navbar height               | Should be 3.6rem (57.6px)     | [ ]  |
| 3    | Verify banner centered horizontally | Banner in middle of navbar    | [ ]  |
| 4    | Verify banner CTA clickable         | "Create My Goal" button works | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### BN-02: Banner Position Mobile

| Step | Action                           | Expected                            | Pass |
| ---- | -------------------------------- | ----------------------------------- | ---- |
| 1    | Mobile 375x667, navigate to `/2` | Page loads                          | [ ]  |
| 2    | Verify banner above navbar       | Separate row at very top            | [ ]  |
| 3    | Inspect total height             | Should be ~6.6rem (navbar + banner) | [ ]  |
| 4    | Verify banner CTA clickable      | Button navigates correctly          | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### BN-03: Banner on Very Small Screen

| Step | Action                                      | Expected        | Pass |
| ---- | ------------------------------------------- | --------------- | ---- |
| 1    | Set viewport to 320x568                     | Smallest mobile | [ ]  |
| 2    | Navigate to `/1`                            | Page loads      | [ ]  |
| 3    | Verify no horizontal scroll                 | Content fits    | [ ]  |
| 4    | Verify banner text wraps/truncates properly | Readable        | [ ]  |
| 5    | Verify CTA still clickable                  | Button works    | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

## Phase 3: Scroll Behavior Tests

### SC-01: Scroll Down Desktop

| Step | Action                             | Expected               | Pass |
| ---- | ---------------------------------- | ---------------------- | ---- |
| 1    | Desktop 1440x900, navigate to `/2` | Page loads             | [ ]  |
| 2    | Scroll down 50px                   | Nothing changes yet    | [ ]  |
| 3    | Scroll down 100px more             | Navbar starts hiding   | [ ]  |
| 4    | Verify smooth animation            | CSS transition visible | [ ]  |
| 5    | Context menu stays visible         | Full info displayed    | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### SC-02: Scroll Down Mobile

| Step | Action                           | Expected                | Pass |
| ---- | -------------------------------- | ----------------------- | ---- |
| 1    | Mobile 375x667, navigate to `/2` | Page loads              | [ ]  |
| 2    | Scroll down 100px                | Navbar+banner hide      | [ ]  |
| 3    | Verify context menu collapses    | Shows minimal info only | [ ]  |
| 4    | Verify MobileReadingTabs hidden  | Tabs disappear          | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### SC-03: Scroll Up Recovery

| Step | Action                                    | Expected                   | Pass |
| ---- | ----------------------------------------- | -------------------------- | ---- |
| 1    | Start from scrolled state (navbar hidden) | Navbar not visible         | [ ]  |
| 2    | Scroll up 10px                            | Navbar starts appearing    | [ ]  |
| 3    | Verify navbar fully visible               | Complete navbar shown      | [ ]  |
| 4    | Verify banner visible                     | Banner in correct position | [ ]  |
| 5    | Verify context menu expanded              | Full info displayed        | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### SC-04: Rapid Scroll (No Flickering)

| Step | Action                     | Expected                            | Pass |
| ---- | -------------------------- | ----------------------------------- | ---- |
| 1    | Navigate to `/2`           | Page loads                          | [ ]  |
| 2    | Rapidly scroll up and down | Fast alternating scroll             | [ ]  |
| 3    | Verify no flickering       | Smooth transitions (150ms debounce) | [ ]  |
| 4    | Verify final state correct | Matches scroll direction            | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

## Phase 4: Drawer Interaction Tests

### DR-01: Navigation Drawer Dimming

| Step | Action                       | Expected                 | Pass |
| ---- | ---------------------------- | ------------------------ | ---- |
| 1    | Navigate to `/1`             | Page loads               | [ ]  |
| 2    | Click hamburger menu         | Drawer opens from left   | [ ]  |
| 3    | Verify navbar items dimmed   | Dark overlay visible     | [ ]  |
| 4    | Verify content dimmed        | Page content has overlay | [ ]  |
| 5    | Mobile: Verify banner dimmed | Banner has overlay       | [ ]  |
| 6    | Click overlay to close       | Drawer closes            | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### DR-02: Search Drawer

| Step | Action            | Expected            | Pass |
| ---- | ----------------- | ------------------- | ---- |
| 1    | Navigate to `/1`  | Page loads          | [ ]  |
| 2    | Click search icon | Search drawer opens | [ ]  |
| 3    | Type "rahman"     | Results appear      | [ ]  |
| 4    | Click a result    | Navigates correctly | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### DR-03: Settings Drawer

| Step | Action                       | Expected                  | Pass |
| ---- | ---------------------------- | ------------------------- | ---- |
| 1    | Navigate to `/1`             | Page loads                | [ ]  |
| 2    | Click settings/gear icon     | Settings drawer opens     | [ ]  |
| 3    | Change theme to Dark         | Theme applies immediately | [ ]  |
| 4    | Verify navbar colors updated | Dark theme colors         | [ ]  |
| 5    | Change theme back to Light   | Theme reverts             | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

## Phase 5: Context Menu Tests

### CM-01: Context Menu Content

| Step | Action              | Expected                        | Pass |
| ---- | ------------------- | ------------------------------- | ---- |
| 1    | Navigate to `/76`   | Al-Insan page loads             | [ ]  |
| 2    | Verify chapter name | "76. Al-Insan" displayed        | [ ]  |
| 3    | Verify page info    | "Juz 29", "Hizb 58", "Page 578" | [ ]  |
| 4    | Verify progress bar | Shows reading progress          | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### CM-02: Context Menu on Different Routes

| Route       | Chapter Info         | Page Info      | Pass |
| ----------- | -------------------- | -------------- | ---- |
| `/1`        | 1. Al-Fatihah        | Juz 1, Page 1  | [ ]  |
| `/2/255`    | 2. Al-Baqarah        | Juz 3, Page 42 | [ ]  |
| `/page/300` | Correct chapter      | Page 300       | [ ]  |
| `/juz/15`   | First chapter in juz | Juz 15         | [ ]  |
| `/hizb/30`  | Correct chapter      | Hizb 30        | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### CM-03: Mobile Reading Tabs

| Step | Action                           | Expected                       | Pass |
| ---- | -------------------------------- | ------------------------------ | ---- |
| 1    | Mobile 375x667, navigate to `/1` | Page loads                     | [ ]  |
| 2    | Verify tabs visible              | Translation/Reading tabs shown | [ ]  |
| 3    | Current tab highlighted          | Translation tab active         | [ ]  |
| 4    | Click "Reading" tab              | View switches to reading mode  | [ ]  |
| 5    | Verify URL updated               | Query params may change        | [ ]  |
| 6    | Scroll down                      | Tabs disappear                 | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

## Phase 6: Sidebar Tests

### SB-01: Sidebar Navigation Position

| Step | Action                             | Expected                    | Pass |
| ---- | ---------------------------------- | --------------------------- | ---- |
| 1    | Desktop, navigate to `/1`          | Page loads                  | [ ]  |
| 2    | Click chapter name in context menu | Sidebar opens               | [ ]  |
| 3    | Verify sidebar position            | Below navbar + context menu | [ ]  |
| 4    | With banner visible                | Accounts for banner height  | [ ]  |
| 5    | Scroll down (navbar hides)         | Sidebar adjusts position    | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### SB-02: Notes Sidebar

| Step | Action                    | Expected                   | Pass |
| ---- | ------------------------- | -------------------------- | ---- |
| 1    | Navigate to `/1`          | Page loads                 | [ ]  |
| 2    | Open notes sidebar        | Slides in from right       | [ ]  |
| 3    | Verify top padding        | Accounts for navbar height | [ ]  |
| 4    | With banner visible       | Accounts for banner        | [ ]  |
| 5    | Verify context menu width | Adjusts for sidebar        | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

## Phase 7: Tajweed Bar Tests

### TJ-01: Tajweed Bar Visibility

| Step | Action                             | Expected                | Pass |
| ---- | ---------------------------------- | ----------------------- | ---- |
| 1    | Navigate to `/1` with default font | Page loads              | [ ]  |
| 2    | Verify NO Tajweed bar              | Bar not visible         | [ ]  |
| 3    | Open settings, select Tajweed font | Setting applied         | [ ]  |
| 4    | Verify Tajweed bar appears         | Collapsible bar visible | [ ]  |
| 5    | Click toggle to expand             | Color legend shows      | [ ]  |
| 6    | Click toggle to collapse           | Color legend hides      | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### TJ-02: Tajweed Bar with Scroll

| Step | Action                      | Expected                            | Pass |
| ---- | --------------------------- | ----------------------------------- | ---- |
| 1    | Enable Tajweed font         | Tajweed bar visible                 | [ ]  |
| 2    | Scroll down                 | Navbar hides                        | [ ]  |
| 3    | Verify Tajweed bar behavior | Animates with context menu          | [ ]  |
| 4    | Scroll up                   | Everything reappears                | [ ]  |
| 5    | Verify stacking order       | Banner > Navbar > Context > Tajweed | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

## Phase 8: RTL Tests

### RTL-01: Arabic Language Layout

| Step | Action                    | Expected                    | Pass |
| ---- | ------------------------- | --------------------------- | ---- |
| 1    | Change language to Arabic | Site in RTL mode            | [ ]  |
| 2    | Navigate to `/1`          | Page loads                  | [ ]  |
| 3    | Verify navbar layout      | Logo on right, menu on left | [ ]  |
| 4    | Verify banner position    | Correct alignment           | [ ]  |
| 5    | Open navigation drawer    | Opens from right            | [ ]  |
| 6    | Verify sidebar navigation | Correct positioning         | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

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
| 1    | Mobile, navigate to `/1`     | Page loads                      | [ ]  |
| 2    | Click "Reading" tab          | Switching modes                 | [ ]  |
| 3    | During switch, try scrolling | Scroll should work              | [ ]  |
| 4    | Verify no navbar flicker     | Visibility locked during switch | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

### EC-03: Non-Reader Routes

| Step | Action                       | Expected                | Pass |
| ---- | ---------------------------- | ----------------------- | ---- |
| 1    | Navigate to `/` (homepage)   | Page loads              | [ ]  |
| 2    | Verify NO context menu       | Not rendered            | [ ]  |
| 3    | Verify navbar works normally | Scroll behavior correct | [ ]  |
| 4    | Navigate to `/search`        | Search page loads       | [ ]  |
| 5    | Verify NO context menu       | Not rendered            | [ ]  |

**Result:** [ ] PASS / [ ] FAIL

---

## Test Results Summary

| Phase                 | Tests  | Passed | Failed | Blocked |
| --------------------- | ------ | ------ | ------ | ------- |
| Phase 1: Smoke        | 5      |        |        |         |
| Phase 2: Banner       | 3      |        |        |         |
| Phase 3: Scroll       | 4      |        |        |         |
| Phase 4: Drawer       | 3      |        |        |         |
| Phase 5: Context Menu | 3      |        |        |         |
| Phase 6: Sidebar      | 2      |        |        |         |
| Phase 7: Tajweed      | 2      |        |        |         |
| Phase 8: RTL          | 1      |        |        |         |
| Phase 9: Edge Cases   | 3      |        |        |         |
| **TOTAL**             | **26** |        |        |         |

---

## Sign-Off

| Role      | Name | Date | Signature |
| --------- | ---- | ---- | --------- |
| Tester    |      |      |           |
| Developer |      |      |           |
| Reviewer  |      |      |           |

---

## Notes

_Additional observations during testing:_

---

---

---

---

## Defects Found

| ID  | Description | Severity | Steps to Reproduce |
| --- | ----------- | -------- | ------------------ |
|     |             |          |                    |
|     |             |          |                    |
|     |             |          |                    |
