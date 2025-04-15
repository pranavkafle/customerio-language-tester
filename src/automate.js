(async () => {
    // --- Helper functions ---
    // Wait until a condition is met (polling every `interval` ms, up to `timeout` ms)
    function waitForCondition(conditionFn, timeout = 5000, interval = 100) {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        (function check() {
          try {
            if (conditionFn()) return resolve();
          } catch (e) {
            return reject(e);
          }
          if (Date.now() - start > timeout) {
            return reject(new Error("Timeout waiting for condition."));
          }
          setTimeout(check, interval);
        })();
      });
    }
  
    // Wait until an element matching the selector exists in the DOM
    function waitForElement(selector, timeout = 5000, interval = 100) {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        (function check() {
          const el = document.querySelector(selector);
          if (el) return resolve(el);
          if (Date.now() - start > timeout)
            return reject(new Error(`Timeout waiting for element ${selector}`));
          setTimeout(check, interval);
        })();
      });
    }
  
    // Retry an asynchronous action with exponential backoff
    async function retryWithExponentialBackoff(actionFn, maxRetries = 5, initialDelay = 200) {
      let delay = initialDelay;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await actionFn();
        } catch (e) {
          if (attempt === maxRetries - 1) throw e;
          console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay} ms.`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
        }
      }
    }
  
    // --- Main process for each tab ---
    async function processTab(tab) {
      const name = tab.textContent.trim() || "[Unnamed Tab]";
      console.log(`\n► Processing tab: "${name}"`);
      tab.click();
  
      // Wait until the main "Send test" button is enabled
      const mainBtnSelector = 'div.cio-send-test button.fly-btn.fly-btn--sm';
      await waitForCondition(() => {
        const btn = document.querySelector(mainBtnSelector);
        return btn && !btn.disabled;
      });
      const mainBtn = document.querySelector(mainBtnSelector);
      console.log(`Main "Send test" button enabled on "${name}". Clicking it.`);
      mainBtn.click();
  
      // Wait for the modal to appear
      const modalSelector = '#fly-modals .fly-modal';
      let modal;
      try {
        modal = await waitForElement(modalSelector, 5000, 100);
        console.log(`Modal appeared for "${name}".`);
      } catch (e) {
        console.warn(`Modal did not appear for "${name}". Skipping this tab.`);
        throw new Error("ModalNotFound");
      }
  
      // Short delay in case of animations
      await new Promise(res => setTimeout(res, 100));
  
      // In the modal, click the "Send test" button
      const modalSendBtn = modal.querySelector('button.fly-btn.fly-btn--sm.fly-btn--primary[type="submit"]');
      if (modalSendBtn) {
        console.log(`Clicking modal's "Send test" button on "${name}".`);
        modalSendBtn.click();
        // Wait (with exponential backoff) for confirmation that the test was sent
        await retryWithExponentialBackoff(async () => {
          await waitForCondition(() => modal.innerText.includes("Test sent!"), 3000, 100);
        });
        console.log(`Confirmation ("Test sent!") detected for "${name}".`);
      } else {
        console.warn(`Modal "Send test" button not found on "${name}".`);
        throw new Error("ModalSendBtnNotFound");
      }
  
      // Click the Cancel button to close the modal
      const cancelBtn = Array.from(modal.querySelectorAll('button.fly-btn.fly-btn--sm'))
        .find(btn => btn.textContent.trim() === "Cancel");
      if (cancelBtn) {
        console.log(`Clicking modal's "Cancel" button on "${name}".`);
        cancelBtn.click();
        // Wait until the modal disappears
        await waitForCondition(() => !document.querySelector(modalSelector), 3000, 100);
        console.log(`Modal closed for "${name}".`);
      } else {
        console.warn(`Modal "Cancel" button not found on "${name}".`);
        throw new Error("CancelButtonNotFound");
      }
    }
  
    // --- Statistics & Summary Logging ---
    const summary = []; // To hold each tab's summary info.
    const overallStart = Date.now();
  
    // Helper function to format time
    function formatTime(ms) {
      const seconds = (ms / 1000).toFixed(2);
      return seconds >= 1 ? `${seconds}s` : `${ms}ms`;
    }
  
    // Check if dropdown exists first
    const dropdownTrigger = document.querySelector('li.fly-responsive-tabs__dropdown button.fly-badge');
    let tabs = [];
  
    console.log('\n🚀 Starting Language Test Automation...');
    console.log('⏱️  Start Time:', new Date().toLocaleTimeString());
  
    if (dropdownTrigger) {
      console.log('\n📋 Dropdown detected! Opening to access all languages...');
      try {
        // Click to open dropdown
        dropdownTrigger.click();
        
        // Wait for dropdown content to appear
        await waitForElement('div.fly-responsive-tabs__dropdown-content', 2000);
        console.log('✅ Dropdown opened successfully');
        
        // Get ALL language tabs from the dropdown
        tabs = Array.from(document.querySelectorAll('div.fly-responsive-tabs__dropdown-content a.fly-responsive-tabs__dropdown-item-link'));
        console.log(`📚 Found ${tabs.length} total languages in dropdown`);
        
        // Try to close dropdown after getting the tabs
        try {
          if (document.querySelector('div.fly-responsive-tabs__dropdown-content')) {
            dropdownTrigger.click();
            await new Promise(res => setTimeout(res, 100));
            console.log('🔽 Dropdown closed');
          }
        } catch (e) {
          console.warn('⚠️  Could not close dropdown:', e);
        }
      } catch (e) {
        console.error('❌ Error accessing dropdown:', e);
        // Fall back to visible tabs if dropdown fails
        console.log('🔄 Falling back to visible tabs...');
        tabs = Array.from(document.querySelectorAll('a.fly-nav-tab__link'));
      }
    } else {
      console.log('\n📋 No dropdown found - using visible tabs');
      tabs = Array.from(document.querySelectorAll('a.fly-nav-tab__link'));
    }
  
    console.log(`\n🎯 Starting to process ${tabs.length} languages...\n`);
  
    // Process all tabs (whether from dropdown or visible)
    for (const tab of tabs) {
      const tabName = tab.textContent.trim() || "[Unnamed Tab]";
      const startTime = Date.now();
      try {
        await processTab(tab);
        const elapsed = Date.now() - startTime;
        summary.push({ 
          Tab: tabName, 
          Status: "✅ Success", 
          Time: formatTime(elapsed)
        });
      } catch (e) {
        const elapsed = Date.now() - startTime;
        summary.push({ 
          Tab: tabName, 
          Status: `❌ Error: ${e.message}`, 
          Time: formatTime(elapsed)
        });
        console.error(`❌ Error processing "${tabName}":`, e);
      }
    }
  
    const overallTime = Date.now() - overallStart;
  
    // Log the detailed summary
    console.log("\n📊 ====== Test Send Summary ======");
    console.log(`⏱️  End Time: ${new Date().toLocaleTimeString()}`);
    console.log(`⏱️  Total Duration: ${formatTime(overallTime)}`);
    console.log("\n📋 Results by Language:");
    console.table(summary);
    
    const successes = summary.filter(entry => entry.Status === "✅ Success").length;
    const failures = summary.length - successes;
    console.log("\n📈 Statistics:");
    console.log(`📚 Total Languages Processed: ${summary.length}`);
    console.log(`✅ Successful: ${successes}`);
    console.log(`❌ Failed: ${failures}`);
    console.log(`⏱️  Average Time per Language: ${formatTime(overallTime / summary.length)}`);
    console.log("================================\n");
  })();
  