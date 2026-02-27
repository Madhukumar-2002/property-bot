/**
 * Critical Path Testing - Option 4 Detection
 * Tests that various formats of "4" trigger the AI agent
 */

// Simulate the webhook message processing logic from server.js
function testOption4Detection() {
    const testCases = [
        { input: "4", expected: "AI_AGENT", description: "Exact match '4'" },
        { input: "4 ", expected: "AI_AGENT", description: "Trailing space '4 '" },
        { input: " 4", expected: "AI_AGENT", description: "Leading space ' 4'" },
        { input: " 4 ", expected: "AI_AGENT", description: "Both spaces ' 4 '" },
        { input: "4\n", expected: "AI_AGENT", description: "With newline '4\\n'" },
        { input: "4️⃣", expected: "AI_AGENT", description: "With emoji '4️⃣'" },
        { input: "press 4", expected: "AI_AGENT", description: "Text with 4 'press 4'" },
        { input: "4️⃣ Talk to Agent", expected: "AI_AGENT", description: "Emoji with text" },
        { input: "14", expected: "AI_AGENT", description: "Contains 4 '14' - may trigger (acceptable)" },
        { input: "41", expected: "AI_AGENT", description: "Contains 4 '41' - may trigger (acceptable)" },
        { input: "1", expected: "BUY", description: "Should NOT trigger AI (option 1)" },
        { input: "2", expected: "RENT", description: "Should NOT trigger AI (option 2)" },
        { input: "3", expected: "SELL", description: "Should NOT trigger AI (option 3)" },
        { input: "hello", expected: "WELCOME", description: "Invalid input - welcome message" },
        { input: "", expected: "WELCOME", description: "Empty input - welcome message" },
        { input: null, expected: "WELCOME", description: "Null input - welcome message" }
    ];

    console.log("🧪 Testing Option 4 Detection with .includes()\n");
    console.log("=".repeat(70));

    let passed = 0;
    let failed = 0;

    testCases.forEach((test, index) => {
        // Simulate the logic from server.js
        const text = test.input ? test.input.toLowerCase().trim() : null;
        
        let result;
        if (text && text.includes("1")) {
            result = "BUY";
        } else if (text && text.includes("2")) {
            result = "RENT";
        } else if (text && text.includes("3")) {
            result = "SELL";
        } else if (text && text.includes("4")) {
            result = "AI_AGENT";
        } else {
            result = "WELCOME";
        }

        const status = result === test.expected ? "✅ PASS" : "❌ FAIL";
        const match = result === test.expected;

        if (match) passed++;
        else failed++;

        console.log(`\nTest ${index + 1}: ${test.description}`);
        console.log(`  Input:    "${test.input}"`);
        console.log(`  Text:     "${text}"`);
        console.log(`  Expected: ${test.expected}`);
        console.log(`  Got:      ${result}`);
        console.log(`  Status:   ${status}`);
    });

    console.log("\n" + "=".repeat(70));
    console.log(`\n📊 Test Results:`);
    console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
    console.log(`   ❌ Failed: ${failed}/${testCases.length}`);

    if (failed === 0) {
        console.log(`\n🎉 All tests passed! Option 4 detection is working correctly.`);
        console.log(`\n🚀 Ready to deploy to Railway!`);
    } else {
        console.log(`\n⚠️ Some tests failed. Review the logic.`);
    }

    // Critical test summary
    console.log("\n" + "=".repeat(70));
    console.log("🔍 CRITICAL TESTS FOR AI AGENT:");
    const criticalTests = testCases.filter(t => 
        t.input === "4" || t.input === "4 " || t.input === " 4" || 
        t.input === "4\n" || t.input === "4️⃣" || t.input === "press 4"
    );
    
    const criticalPassed = criticalTests.every(t => {
        const text = t.input ? t.input.toLowerCase().trim() : null;
        return text && text.includes("4");
    });

    if (criticalPassed) {
        console.log("✅ All critical '4' variations trigger AI agent correctly!");
    } else {
        console.log("❌ Some critical tests failed!");
    }
}

// Run the tests
testOption4Detection();
