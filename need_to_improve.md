# Bill Snap — Improvements & Polish Notes

## Pending UX & Functional Polish

### 1. "Analyze Bill" Button State When No Model / API Key Is Configured
- **Current Behavior**: If the user has not configured a Gemini API key or if the model cache is empty, the "Analyze Bill" button is clickable, and clicking it triggers an error or warning toast.
- **Desired Behavior**: 
  - The "Analyze Bill" button should be completely greyed out / disabled (`disabled={!isEngineReady || !activeModel}`) when no valid API key or active models exist in `localStorage`.
  - Display a subtle helper pill or text beneath the button: *"Set your API key in the menu to analyze bills"*, which directly opens the sidebar on tap.
