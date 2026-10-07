import ast
import io
import json
import re
import subprocess
import sys
import time
from typing import Dict, Any, List, Optional, Tuple


# Algorithmic Challenge Repository with Multi-Language Starter Templates & Test Suites
CODING_CHALLENGES = [
    {
        "id": 1,
        "title": "Two Sum with Indices",
        "difficulty": "EASY",
        "description": "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. Assume each input has exactly one solution and you may not use the same element twice.",
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        "examples": [
            {"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]"},
            {"input": "nums = [3, 2, 4], target = 6", "output": "[1, 2]"}
        ],
        "function_name": "two_sum",
        "function_names": {
            "python": "two_sum",
            "javascript": "twoSum",
            "java": "twoSum",
            "cpp": "twoSum"
        },
        "initial_code": "def two_sum(nums: list, target: int) -> list:\n    # Implement optimal hash map solution\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n",
        "starter_templates": {
            "python": "def two_sum(nums: list, target: int) -> list:\n    # Implement optimal hash map solution\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n",
            "javascript": "function twoSum(nums, target) {\n    // Implement optimal hash map solution\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (seen.has(diff)) {\n            return [seen.get(diff), i];\n        }\n        seen.set(nums[i], i);\n    }\n    return [];\n}\n",
            "java": "import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Implement optimal hash map solution\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (seen.containsKey(diff)) {\n                return new int[]{seen.get(diff), i};\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}\n",
            "cpp": "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Implement optimal hash map solution\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (seen.find(diff) != seen.end()) {\n                return {seen[diff], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};\n"
        },
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(n)",
        "visible_tests": [
            {"input": ([2, 7, 11, 15], 9), "expected": [0, 1]},
            {"input": ([3, 2, 4], 6), "expected": [1, 2]},
            {"input": ([3, 3], 6), "expected": [0, 1]}
        ],
        "hidden_tests": [
            {"input": ([-1, -2, -3, -4, -5], -8), "expected": [2, 4]},
            {"input": ([0, 4, 3, 0], 0), "expected": [0, 3]},
            {"input": ([10, 20, 30, 40, 50, 60], 110), "expected": [4, 5]}
        ]
    },
    {
        "id": 2,
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "MEDIUM",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "constraints": [
            "0 <= s.length <= 5 * 10^4",
            "`s` consists of English letters, digits, symbols, and spaces."
        ],
        "examples": [
            {"input": "s = \"abcabcbb\"", "output": "3 (The answer is \"abc\")"},
            {"input": "s = \"bbbbb\"", "output": "1 (The answer is \"b\")"},
            {"input": "s = \"pwwkew\"", "output": "3 (The answer is \"wke\")"}
        ],
        "function_name": "length_of_longest_substring",
        "function_names": {
            "python": "length_of_longest_substring",
            "javascript": "lengthOfLongestSubstring",
            "java": "lengthOfLongestSubstring",
            "cpp": "lengthOfLongestSubstring"
        },
        "initial_code": "def length_of_longest_substring(s: str) -> int:\n    # Implement sliding window algorithm\n    char_index = {}\n    max_len = 0\n    start = 0\n    for end, ch in enumerate(s):\n        if ch in char_index and char_index[ch] >= start:\n            start = char_index[ch] + 1\n        char_index[ch] = end\n        max_len = max(max_len, end - start + 1)\n    return max_len\n",
        "starter_templates": {
            "python": "def length_of_longest_substring(s: str) -> int:\n    # Implement sliding window algorithm\n    char_index = {}\n    max_len = 0\n    start = 0\n    for end, ch in enumerate(s):\n        if ch in char_index and char_index[ch] >= start:\n            start = char_index[ch] + 1\n        char_index[ch] = end\n        max_len = max(max_len, end - start + 1)\n    return max_len\n",
            "javascript": "function lengthOfLongestSubstring(s) {\n    // Implement sliding window algorithm\n    const charIndex = new Map();\n    let maxLen = 0;\n    let start = 0;\n    for (let end = 0; end < s.length; end++) {\n        const ch = s[end];\n        if (charIndex.has(ch) && charIndex.get(ch) >= start) {\n            start = charIndex.get(ch) + 1;\n        }\n        charIndex.set(ch, end);\n        maxLen = Math.max(maxLen, end - start + 1);\n    }\n    return maxLen;\n}\n",
            "java": "import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Implement sliding window algorithm\n        Map<Character, Integer> charIndex = new HashMap<>();\n        int maxLen = 0;\n        int start = 0;\n        for (int end = 0; end < s.length(); end++) {\n            char ch = s.charAt(end);\n            if (charIndex.containsKey(ch) && charIndex.get(ch) >= start) {\n                start = charIndex.get(ch) + 1;\n            }\n            charIndex.put(ch, end);\n            maxLen = Math.max(maxLen, end - start + 1);\n        }\n        return maxLen;\n    }\n}\n",
            "cpp": "#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Implement sliding window algorithm\n        unordered_map<char, int> charIndex;\n        int maxLen = 0;\n        int start = 0;\n        for (int end = 0; end < s.length(); end++) {\n            char ch = s[end];\n            if (charIndex.find(ch) != charIndex.end() && charIndex[ch] >= start) {\n                start = charIndex[ch] + 1;\n            }\n            charIndex[ch] = end;\n            maxLen = max(maxLen, end - start + 1);\n        }\n        return maxLen;\n    }\n};\n"
        },
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(min(m, n))",
        "visible_tests": [
            {"input": ("abcabcbb",), "expected": 3},
            {"input": ("bbbbb",), "expected": 1},
            {"input": ("pwwkew",), "expected": 3}
        ],
        "hidden_tests": [
            {"input": ("",), "expected": 0},
            {"input": (" ",), "expected": 1},
            {"input": ("au",), "expected": 2},
            {"input": ("dvdf",), "expected": 3}
        ]
    },
    {
        "id": 3,
        "title": "Merge Overlapping Intervals",
        "difficulty": "MEDIUM",
        "description": "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all intervals in the input.",
        "constraints": [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= start_i <= end_i <= 10^4"
        ],
        "examples": [
            {"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]"},
            {"input": "intervals = [[1,4],[4,5]]", "output": "[[1,5]]"}
        ],
        "function_name": "merge_intervals",
        "function_names": {
            "python": "merge_intervals",
            "javascript": "mergeIntervals",
            "java": "mergeIntervals",
            "cpp": "mergeIntervals"
        },
        "initial_code": "def merge_intervals(intervals: list) -> list:\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        prev = merged[-1]\n        if current[0] <= prev[1]:\n            prev[1] = max(prev[1], current[1])\n        else:\n            merged.append(current)\n    return merged\n",
        "starter_templates": {
            "python": "def merge_intervals(intervals: list) -> list:\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        prev = merged[-1]\n        if current[0] <= prev[1]:\n            prev[1] = max(prev[1], current[1])\n        else:\n            merged.append(current)\n    return merged\n",
            "javascript": "function mergeIntervals(intervals) {\n    if (!intervals || intervals.length === 0) return [];\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const current = intervals[i];\n        const prev = merged[merged.length - 1];\n        if (current[0] <= prev[1]) {\n            prev[1] = Math.max(prev[1], current[1]);\n        } else {\n            merged.push(current);\n        }\n    }\n    return merged;\n}\n",
            "java": "import java.util.ArrayList;\nimport java.util.Arrays;\nimport java.util.List;\n\npublic class Solution {\n    public int[][] mergeIntervals(int[][] intervals) {\n        if (intervals == null || intervals.length == 0) return new int[0][0];\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> merged = new ArrayList<>();\n        merged.add(intervals[0]);\n        for (int i = 1; i < intervals.length; i++) {\n            int[] current = intervals[i];\n            int[] prev = merged.get(merged.size() - 1);\n            if (current[0] <= prev[1]) {\n                prev[1] = Math.max(prev[1], current[1]);\n            } else {\n                merged.add(current);\n            }\n        }\n        return merged.toArray(new int[merged.size()][]);\n    }\n}\n",
            "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        sort(intervals.begin(), intervals.end());\n        vector<vector<int>> merged = {intervals[0]};\n        for (size_t i = 1; i < intervals.size(); i++) {\n            auto& prev = merged.back();\n            if (intervals[i][0] <= prev[1]) {\n                prev[1] = max(prev[1], intervals[i][1]);\n            } else {\n                merged.push_back(intervals[i]);\n            }\n        }\n        return merged;\n    }\n};\n"
        },
        "expected_time_complexity": "O(n log n)",
        "expected_space_complexity": "O(n)",
        "visible_tests": [
            {"input": ([[1, 3], [2, 6], [8, 10], [15, 18]],), "expected": [[1, 6], [8, 10], [15, 18]]},
            {"input": ([[1, 4], [4, 5]],), "expected": [[1, 5]]}
        ],
        "hidden_tests": [
            {"input": ([[1, 4], [0, 4]],), "expected": [[0, 4]]},
            {"input": ([[1, 4], [2, 3]],), "expected": [[1, 4]]},
            {"input": ([[1, 10]],), "expected": [[1, 10]]}
        ]
    },
    {
        "id": 4,
        "title": "Valid Parentheses",
        "difficulty": "EASY",
        "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order.",
        "constraints": [
            "1 <= s.length <= 10^4",
            "`s` consists of parentheses only '()[]{}'."
        ],
        "examples": [
            {"input": "s = \"()\"", "output": "true"},
            {"input": "s = \"()[]{}\"", "output": "true"},
            {"input": "s = \"(]\"", "output": "false"}
        ],
        "function_name": "is_valid_parentheses",
        "function_names": {
            "python": "is_valid_parentheses",
            "javascript": "isValidParentheses",
            "java": "isValidParentheses",
            "cpp": "isValidParentheses"
        },
        "initial_code": "def is_valid_parentheses(s: str) -> bool:\n    # Validate balanced parentheses using a stack\n    stack = []\n    mapping = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n",
        "starter_templates": {
            "python": "def is_valid_parentheses(s: str) -> bool:\n    # Validate balanced parentheses using a stack\n    stack = []\n    mapping = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n",
            "javascript": "function isValidParentheses(s) {\n    // Validate balanced parentheses using a stack\n    const stack = [];\n    const mapping = { ')': '(', '}': '{', ']': '[' };\n    for (let i = 0; i < s.length; i++) {\n        const char = s[i];\n        if (char in mapping) {\n            const topElement = stack.length > 0 ? stack.pop() : '#';\n            if (mapping[char] !== topElement) {\n                return false;\n            }\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}\n",
            "java": "import java.util.Stack;\nimport java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public boolean isValidParentheses(String s) {\n        // Validate balanced parentheses using a stack\n        Stack<Character> stack = new Stack<>();\n        Map<Character, Character> mapping = new HashMap<>();\n        mapping.put(')', '(');\n        mapping.put('}', '{');\n        mapping.put(']', '[');\n        for (char c : s.toCharArray()) {\n            if (mapping.containsKey(c)) {\n                char topElement = stack.isEmpty() ? '#' : stack.pop();\n                if (topElement != mapping.get(c)) {\n                    return false;\n                }\n            } else {\n                stack.push(c);\n            }\n        }\n        return stack.isEmpty();\n    }\n}\n",
            "cpp": "#include <string>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValidParentheses(string s) {\n        // Validate balanced parentheses using a stack\n        stack<char> st;\n        unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};\n        for (char c : s) {\n            if (mapping.count(c)) {\n                char topElement = st.empty() ? '#' : st.top();\n                if (!st.empty()) st.pop();\n                if (topElement != mapping[c]) {\n                    return false;\n                }\n            } else {\n                st.push(c);\n            }\n        }\n        return st.empty();\n    }\n};\n"
        },
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(n)",
        "visible_tests": [
            {"input": ("()",), "expected": True},
            {"input": ("()[]{}",), "expected": True},
            {"input": ("(]",), "expected": False}
        ],
        "hidden_tests": [
            {"input": ("([)]",), "expected": False},
            {"input": ("{[]}",), "expected": True},
            {"input": ("",), "expected": True},
            {"input": ("[",), "expected": False}
        ]
    },
    {
        "id": 5,
        "title": "Maximum Subarray Sum",
        "difficulty": "MEDIUM",
        "description": "Given an integer array `nums`, find the subarray with the largest sum and return its sum using Kadane's algorithm.",
        "constraints": [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ],
        "examples": [
            {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6"},
            {"input": "nums = [1]", "output": "1"},
            {"input": "nums = [5,4,-1,7,8]", "output": "23"}
        ],
        "function_name": "max_sub_array",
        "function_names": {
            "python": "max_sub_array",
            "javascript": "maxSubArray",
            "java": "maxSubArray",
            "cpp": "maxSubArray"
        },
        "initial_code": "def max_sub_array(nums: list) -> int:\n    # Find maximum subarray sum in O(n) time\n    if not nums:\n        return 0\n    max_so_far = nums[0]\n    current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far\n",
        "starter_templates": {
            "python": "def max_sub_array(nums: list) -> int:\n    # Find maximum subarray sum in O(n) time\n    if not nums:\n        return 0\n    max_so_far = nums[0]\n    current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far\n",
            "javascript": "function maxSubArray(nums) {\n    // Find maximum subarray sum in O(n) time\n    if (!nums || nums.length === 0) return 0;\n    let maxSoFar = nums[0];\n    let currentMax = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        currentMax = Math.max(nums[i], currentMax + nums[i]);\n        maxSoFar = Math.max(maxSoFar, currentMax);\n    }\n    return maxSoFar;\n}\n",
            "java": "public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Find maximum subarray sum in O(n) time\n        if (nums == null || nums.length == 0) return 0;\n        int maxSoFar = nums[0];\n        int currentMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currentMax = Math.max(nums[i], currentMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currentMax);\n        }\n        return maxSoFar;\n    }\n}\n",
            "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Find maximum subarray sum in O(n) time\n        if (nums.empty()) return 0;\n        int maxSoFar = nums[0];\n        int currentMax = nums[0];\n        for (size_t i = 1; i < nums.size(); i++) {\n            currentMax = max(nums[i], currentMax + nums[i]);\n            maxSoFar = max(maxSoFar, currentMax);\n        }\n        return maxSoFar;\n    }\n};\n"
        },
        "expected_time_complexity": "O(n)",
        "expected_space_complexity": "O(1)",
        "visible_tests": [
            {"input": ([-2, 1, -3, 4, -1, 2, 1, -5, 4],), "expected": 6},
            {"input": ([1],), "expected": 1},
            {"input": ([5, 4, -1, 7, 8],), "expected": 23}
        ],
        "hidden_tests": [
            {"input": ([-1],), "expected": -1},
            {"input": ([-2, -1],), "expected": -1},
            {"input": ([1, 2, 3, 4],), "expected": 10}
        ]
    }
]


def detect_algorithmic_complexity(code: str, language: str = "python") -> Tuple[str, str, str]:
    """
    Parses Abstract Syntax Tree (AST) or token structures across Python, JavaScript, Java, and C++
    to detect asymptotic time and space complexity patterns:
    - Loop nesting depth (O(1), O(n), O(n^2), O(n^3))
    - Sorting invocations (O(n log n))
    - Auxiliary collections and storage allocations (O(1) vs O(n))
    """
    lang = language.lower().strip()
    if lang == "python":
        try:
            tree = ast.parse(code)
        except Exception as e:
            return "Unknown", "Unknown", f"Syntax parsing error in Python: {e}"

        max_loop_depth = 0
        has_sort = False
        has_auxiliary_store = False

        class ComplexityVisitor(ast.NodeVisitor):
            def __init__(self):
                self.current_depth = 0
                self.max_depth = 0
                self.has_sort = False
                self.has_aux = False

            def visit_For(self, node):
                self.current_depth += 1
                if self.current_depth > self.max_depth:
                    self.max_depth = self.current_depth
                self.generic_visit(node)
                self.current_depth -= 1

            def visit_While(self, node):
                self.current_depth += 1
                if self.current_depth > self.max_depth:
                    self.max_depth = self.current_depth
                self.generic_visit(node)
                self.current_depth -= 1

            def visit_Call(self, node):
                if isinstance(node.func, ast.Name):
                    if node.func.id in ("sorted",):
                        self.has_sort = True
                    if node.func.id in ("dict", "set", "list"):
                        self.has_aux = True
                elif isinstance(node.func, ast.Attribute):
                    if node.func.attr == "sort":
                        self.has_sort = True
                self.generic_visit(node)

            def visit_Dict(self, node):
                self.has_aux = True
                self.generic_visit(node)

            def visit_Set(self, node):
                self.has_aux = True
                self.generic_visit(node)

        visitor = ComplexityVisitor()
        visitor.visit(tree)

        if visitor.has_sort:
            time_c = "O(n log n)"
        elif visitor.max_depth == 0:
            time_c = "O(1)"
        elif visitor.max_depth == 1:
            time_c = "O(n)"
        elif visitor.max_depth == 2:
            time_c = "O(n^2)"
        elif visitor.max_depth >= 3:
            time_c = "O(n^3)"
        else:
            time_c = "O(n)"

        space_c = "O(n)" if visitor.has_aux else "O(1)"
        explanation = (
            f"Detected maximum loop nesting level is {visitor.max_depth}. "
            f"Sorting calls detected: {visitor.has_sort}. "
            f"Auxiliary dynamic collections detected: {visitor.has_aux}."
        )
        return time_c, space_c, explanation

    else:
        # Multi-Language AST/Token Analysis for JavaScript, Java, and C++
        cleaned = re.sub(r'//.*', '', code)
        cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL)
        cleaned = re.sub(r'"(?:\\.|[^"\\])*"', '""', cleaned)
        cleaned = re.sub(r"'(?:\\.|[^'\\])*'", "''", cleaned)

        lines = cleaned.splitlines()
        max_loop_depth = 0
        current_depth = 0
        loop_braces = []

        for line in lines:
            line_str = line.strip()
            is_loop = bool(re.search(r'\b(for|while)\s*\(', line_str) or re.search(r'\.forEach\s*\(', line_str))

            for char in line:
                if char == '{':
                    if is_loop:
                        current_depth += 1
                        loop_braces.append(True)
                        if current_depth > max_loop_depth:
                            max_loop_depth = current_depth
                        is_loop = False
                    else:
                        loop_braces.append(False)
                elif char == '}':
                    if loop_braces:
                        was_loop = loop_braces.pop()
                        if was_loop:
                            current_depth = max(0, current_depth - 1)

        consecutive_loops = len(re.findall(r'\b(for|while)\s*\(', cleaned))
        if max_loop_depth == 0 and consecutive_loops > 0:
            max_loop_depth = min(consecutive_loops, 2)

        has_sort = False
        if lang in ("javascript", "js"):
            has_sort = bool(re.search(r'\.sort\s*\(', cleaned))
        elif lang == "java":
            has_sort = bool(re.search(r'\b(Arrays|Collections)\.sort\s*\(', cleaned))
        elif lang in ("cpp", "c++"):
            has_sort = bool(re.search(r'\b(std::)?sort\s*\(', cleaned))

        has_aux = False
        if lang in ("javascript", "js"):
            has_aux = bool(re.search(r'\b(new\s+(Map|Set|Array)|\[\]|\{\})\b', cleaned) or 'new Map' in code or 'new Set' in code)
        elif lang == "java":
            has_aux = bool(re.search(r'\b(new\s+(HashMap|HashSet|ArrayList|int\s*\[))', cleaned) or 'Map<' in code or 'HashMap' in code)
        elif lang in ("cpp", "c++"):
            has_aux = bool(re.search(r'\b(unordered_map|unordered_set|vector|map|set|stack)\b', cleaned))

        if has_sort:
            time_c = "O(n log n)"
        elif max_loop_depth == 0:
            time_c = "O(1)"
        elif max_loop_depth == 1:
            time_c = "O(n)"
        elif max_loop_depth == 2:
            time_c = "O(n^2)"
        elif max_loop_depth >= 3:
            time_c = "O(n^3)"
        else:
            time_c = "O(n)"

        space_c = "O(n)" if has_aux else "O(1)"
        lang_display = "JavaScript" if lang in ("javascript", "js") else ("Java" if lang == "java" else "C++")
        explanation = (
            f"Detected maximum loop nesting level is {max_loop_depth} in {lang_display}. "
            f"Sorting operations detected: {has_sort}. "
            f"Auxiliary dynamic structures detected: {has_aux}."
        )
        return time_c, space_c, explanation


def _transpile_java_for_node(code: str) -> str:
    """Translates algorithmic Java solution to Node.js executable code."""
    lines = code.splitlines()
    clean_lines = [l for l in lines if not l.strip().startswith("import ") and not l.strip().startswith("package ")]
    text = "\n".join(clean_lines)

    text = re.sub(r'public\s+class\s+\w+\s*\{', '', text)
    if text.rstrip().endswith("}"):
        text = text.rstrip()[:-1]

    def clean_func_sig(m):
        fname = m.group(1)
        params_str = m.group(2)
        params = [p.strip().split()[-1] for p in params_str.split(',') if p.strip()]
        return f"function {fname}({', '.join(params)}) {{"

    text = re.sub(
        r'\bpublic\s+(?:[A-Za-z0-9_<>[\]]+)\s+(\w+)\s*\(([^)]*)\)\s*\{',
        clean_func_sig,
        text
    )

    text = re.sub(r'(\([^)]*\))\s*->', r'\1 =>', text)
    text = re.sub(r'for\s*\(\s*(?:final\s+)?[A-Za-z0-9_<>[\]]+\s+(\w+)\s*:\s*([^)]+)\)', r'for (let \1 of \2)', text)
    text = re.sub(r'\b(?:int(?:\[\])+|int|boolean|String|char|double|float|long|size_t)\s+(\w+)\s*=', r'let \1 =', text)
    text = re.sub(r'\b(?:Map|HashMap|Set|HashSet|List|ArrayList|Stack)<[^>]*>\s+(\w+)\s*=', r'let \1 =', text)
    text = re.sub(r'new\s+int\[\]\s*\{([^}]*)\}', r'[\1]', text)
    text = re.sub(r'new\s+int\[\]\s*\{\}', r'[]', text)
    text = re.sub(r'new\s+int\[\d*\]\[\d*\]', r'[]', text)
    text = re.sub(r'new\s+(HashMap|HashSet|ArrayList|Stack)<[^>]*>\(\)', r'new \1()', text)
    text = re.sub(r'\.toCharArray\(\)', '.split("")', text)
    text = re.sub(r'\.length\(\)', '.length', text)
    text = re.sub(r'Integer\.compare\(([^,]+),\s*([^)]+)\)', r'(\1 - \2)', text)
    text = re.sub(r'\.toArray\([^;]*\)', '', text)
    return text


def _transpile_cpp_for_node(code: str) -> str:
    """Translates algorithmic C++ solution to Node.js executable code."""
    lines = code.splitlines()
    clean_lines = [l for l in lines if not l.strip().startswith("#include") and not l.strip().startswith("using namespace")]
    text = "\n".join(clean_lines)

    text = re.sub(r'class\s+Solution\s*\{', '', text)
    text = re.sub(r'public:\s*', '', text)
    if text.rstrip().endswith("};"):
        text = text.rstrip()[:-2]
    elif text.rstrip().endswith("}"):
        text = text.rstrip()[:-1]

    def clean_cpp_sig(m):
        fname = m.group(1)
        params_str = m.group(2)
        params = [p.replace('&', ' ').strip().split()[-1] for p in params_str.split(',') if p.strip()]
        return f"function {fname}({', '.join(params)}) {{"

    text = re.sub(
        r'\b(?:vector\s*<[^;{}]+>|[A-Za-z0-9_<>]+)\s+(\w+)\s*\(([^)]*)\)\s*\{',
        clean_cpp_sig,
        text
    )

    def map_init_sub(m):
        var_name = m.group(1)
        content = m.group(2).strip()
        pairs = re.findall(r'\{\s*(\'?[^\',]+\'?)\s*,\s*(\'?[^\',]+\'?)\s*\}', content)
        if pairs:
            js_pairs = ", ".join(f"[{k.strip()}, {v.strip()}]" for k, v in pairs)
            return f"let {var_name} = new unordered_map([{js_pairs}]);"
        return f"let {var_name} = new unordered_map();"

    text = re.sub(r'unordered_map<[^>]+>\s+(\w+)\s*=\s*\{([^;]+)\};', map_init_sub, text)
    text = re.sub(r'\bunordered_map<[^>]+>\s+(\w+);', r'let \1 = new unordered_map();', text)
    text = re.sub(r'\b(stack|vector)<[^>]+>\s+(\w+);', r'let \2 = new \1();', text)
    text = re.sub(r'\bvector\s*<[^;{}]+>\s+(\w+)\s*=\s*\{([^;\}]+)\};', r'let \1 = [\2];', text)
    text = re.sub(r'\bvector\s*<[^;{}]+>\s+(\w+)\s*=', r'let \1 =', text)
    text = re.sub(r'for\s*\(\s*(?:const\s+)?[A-Za-z0-9_&]+\s+(\w+)\s*:\s*([^)]+)\)', r'for (let \1 of \2)', text)
    text = re.sub(r'\b(?:size_t|int|long|auto|char|bool|double|float)(?:\s*&\s*|\s+)(\w+)\s*=', r'let \1 =', text)
    text = re.sub(r'\.length\(\)', '.length', text)
    text = re.sub(r'\.size\(\)', '.length', text)
    text = re.sub(r'!\s*(\w+)\.empty\(\)', r'(!\1.empty())', text)
    text = re.sub(r'(\w+)\.empty\(\)', r'(\1.empty ? \1.empty() : \1.length === 0)', text)
    text = re.sub(r'return\s+\{([^;\}]*)\};', r'return [\1];', text)
    text = re.sub(r'\.find\(([^)]+)\)\s*!=\s*\w+\.end\(\)', r'.has(\1)', text)
    text = re.sub(r'std::max', 'Math.max', text)
    text = re.sub(r'\bmax\(', 'Math.max(', text)
    text = re.sub(r'sort\(([^.]+)\.begin\(\),\s*\1\.end\(\)\);', r'\1.sort((x, y) => Array.isArray(x) ? x[0] - y[0] : x - y);', text)
    return text


def execute_test_suite(
    code: str,
    problem_id: int,
    language: str = "python",
    include_hidden: bool = False
) -> Dict[str, Any]:
    """
    Executes submitted code across Python, JavaScript, Java, and C++ against test cases with performance telemetry.
    """
    problem = next((p for p in CODING_CHALLENGES if p["id"] == problem_id), CODING_CHALLENGES[0])
    lang = language.lower().strip()
    func_names = problem.get("function_names", {})
    func_name = func_names.get(lang, problem["function_name"])

    tests_to_run = list(problem["visible_tests"])
    if include_hidden:
        tests_to_run.extend(problem["hidden_tests"])

    # 1. Python Execution Sandbox
    if lang == "python":
        local_namespace: Dict[str, Any] = {}
        stdout_capture = io.StringIO()
        old_stdout = sys.stdout

        try:
            sys.stdout = stdout_capture
            compiled = compile(code, "<user_code>", "exec")
            exec(compiled, {}, local_namespace)
        except Exception as e:
            sys.stdout = old_stdout
            return {
                "all_passed": False,
                "passed_count": 0,
                "total_count": len(tests_to_run),
                "results": [{
                    "test_number": 1,
                    "input": "Compilation",
                    "expected": "Success",
                    "actual": f"Error: {str(e)}",
                    "passed": False,
                    "error": str(e),
                    "execution_time_ms": 0.0
                }],
                "console_output": stdout_capture.getvalue()
            }
        finally:
            sys.stdout = old_stdout

        if func_name not in local_namespace or not callable(local_namespace[func_name]):
            return {
                "all_passed": False,
                "passed_count": 0,
                "total_count": len(tests_to_run),
                "results": [{
                    "test_number": 1,
                    "input": "Function Lookup",
                    "expected": f"Function named `{func_name}`",
                    "actual": "Not found in submitted code.",
                    "passed": False,
                    "error": f"Function `{func_name}` not defined.",
                    "execution_time_ms": 0.0
                }],
                "console_output": stdout_capture.getvalue()
            }

        func = local_namespace[func_name]
        results = []
        passed_count = 0

        for idx, tc in enumerate(tests_to_run, start=1):
            args = tc["input"]
            expected = tc["expected"]

            start_t = time.perf_counter()
            try:
                actual = func(*args)
                elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
                passed = (actual == expected)
                if passed:
                    passed_count += 1
                err = None
            except Exception as ex:
                elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
                actual = None
                passed = False
                err = str(ex)

            results.append({
                "test_number": idx,
                "input": str(args),
                "expected": str(expected),
                "actual": str(actual) if actual is not None else "Exception",
                "passed": passed,
                "error": err,
                "execution_time_ms": elapsed_ms
            })

        return {
            "all_passed": (passed_count == len(tests_to_run)),
            "passed_count": passed_count,
            "total_count": len(tests_to_run),
            "results": results,
            "console_output": stdout_capture.getvalue()
        }

    # 2. JavaScript, Java, and C++ Execution via Node.js Polyglot Sandbox
    else:
        if lang in ("javascript", "js"):
            adapted_code = code
        elif lang == "java":
            adapted_code = _transpile_java_for_node(code)
        elif lang in ("cpp", "c++"):
            adapted_code = _transpile_cpp_for_node(code)
        else:
            adapted_code = code

        polyfills = """
Array.prototype.empty = function() { return this.length === 0; };
Array.prototype.back = function() { return this[this.length - 1]; };
Array.prototype.push_back = function(x) { this.push(x); };
Array.prototype.size = function() { return this.length; };

class HashMap extends Map {
    containsKey(k) { return this.has(k); }
    put(k, v) { this.set(k, v); }
}
class HashSet extends Set {
    contains(k) { return this.has(k); }
}
class ArrayList extends Array {
    add(x) { this.push(x); }
    get(i) { return this[i]; }
}
class Stack extends Array {
    push(x) { super.push(x); }
    pop() { return super.pop(); }
    peek() { return this[this.length - 1]; }
    isEmpty() { return this.length === 0; }
}
class unordered_map {
    constructor(entries) {
        if (entries && Array.isArray(entries)) {
            for (const item of entries) {
                if (Array.isArray(item) && item.length >= 2) {
                    this[item[0]] = item[1];
                }
            }
        }
    }
    has(k) { return Object.prototype.hasOwnProperty.call(this, k) || this[k] !== undefined; }
    count(k) { return (Object.prototype.hasOwnProperty.call(this, k) || this[k] !== undefined) ? 1 : 0; }
    find(k) { return (this[k] !== undefined) ? k : undefined; }
    end() { return undefined; }
}
class stack extends Array {
    top() { return this[this.length - 1]; }
    empty() { return this.length === 0; }
}
class vector extends Array {
    size() { return this.length; }
    empty() { return this.length === 0; }
    back() { return this[this.length - 1]; }
    push_back(x) { this.push(x); }
}
const Arrays = {
    sort: (a, comp) => comp ? a.sort(comp) : a.sort((x, y) => x - y)
};
"""
        json_tests = []
        for tc in tests_to_run:
            json_tests.append({
                "input": list(tc["input"]),
                "expected": tc["expected"]
            })

        runner_script = f"""
{polyfills}

try {{
{adapted_code}
}} catch (compileErr) {{
    console.log(JSON.stringify({{
        all_passed: false,
        passed_count: 0,
        total_count: {len(json_tests)},
        results: [{{
            test_number: 1,
            input: "Compilation",
            expected: "Success",
            actual: "Error: " + compileErr.message,
            passed: false,
            error: compileErr.message,
            execution_time_ms: 0.0
        }}],
        console_output: ""
    }}));
    process.exit(0);
}}

const tests = {json.dumps(json_tests)};
const results = [];
let passedCount = 0;

for (let i = 0; i < tests.length; i++) {{
    const tc = tests[i];
    const args = tc.input;
    const expected = tc.expected;
    const start = performance.now();
    let actual = null;
    let passed = false;
    let err = null;

    try {{
        let fn = (typeof {func_name} === 'function') ? {func_name} : (typeof Solution !== 'undefined' && typeof (new Solution()).{func_name} === 'function') ? ((...a) => (new Solution()).{func_name}(...a)) : null;
        if (!fn) {{
            throw new Error('Function `{func_name}` not found in submitted code.');
        }}
        actual = fn(...args);
        passed = JSON.stringify(actual) === JSON.stringify(expected);
        if (passed) passedCount++;
    }} catch (e) {{
        err = e.message;
    }}

    const elapsed = Math.round((performance.now() - start) * 100) / 100;
    results.push({{
        test_number: i + 1,
        input: JSON.stringify(args),
        expected: JSON.stringify(expected),
        actual: err ? "Exception" : JSON.stringify(actual),
        passed,
        error: err,
        execution_time_ms: elapsed
    }});
}}

console.log(JSON.stringify({{
    all_passed: passedCount === tests.length,
    passed_count: passedCount,
    total_count: tests.length,
    results,
    console_output: ""
}}));
"""
        try:
            sub = subprocess.run(["node", "-e", runner_script], capture_output=True, text=True, timeout=8)
            output_str = sub.stdout.strip()
            if output_str:
                return json.loads(output_str)
            else:
                return {
                    "all_passed": False,
                    "passed_count": 0,
                    "total_count": len(tests_to_run),
                    "results": [{
                        "test_number": 1,
                        "input": "Runtime",
                        "expected": "Execution",
                        "actual": "Error: " + (sub.stderr.strip() or "Process terminated without output"),
                        "passed": False,
                        "error": sub.stderr.strip(),
                        "execution_time_ms": 0.0
                    }],
                    "console_output": sub.stderr
                }
        except Exception as ex:
            return {
                "all_passed": False,
                "passed_count": 0,
                "total_count": len(tests_to_run),
                "results": [{
                    "test_number": 1,
                    "input": "Execution",
                    "expected": "Success",
                    "actual": f"Error: {str(ex)}",
                    "passed": False,
                    "error": str(ex),
                    "execution_time_ms": 0.0
                }],
                "console_output": ""
            }


def evaluate_coding_submission(
    problem_id: int,
    code: str,
    language: str = "python",
    approach_explanation: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates complete coding attempt across:
    - Correctness (visible + hidden tests in selected language)
    - Time complexity (detected vs expected in selected language)
    - Space complexity (detected vs expected in selected language)
    - Code quality & edge cases
    """
    problem = next((p for p in CODING_CHALLENGES if p["id"] == problem_id), CODING_CHALLENGES[0])

    exec_res = execute_test_suite(code, problem_id, language=language, include_hidden=True)
    tests_passed = exec_res["passed_count"]
    total_tests = exec_res["total_count"]

    correctness_score = round((tests_passed / max(total_tests, 1)) * 10.0, 1)

    detected_time, detected_space, comp_detail = detect_algorithmic_complexity(code, language=language)
    expected_time = problem["expected_time_complexity"]
    expected_space = problem["expected_space_complexity"]

    if detected_time == expected_time:
        time_score = 9.5
    elif detected_time in ("O(n)", "O(n log n)") and expected_time == "O(n)":
        time_score = 7.5
    elif detected_time == "O(n^2)" and expected_time == "O(n)":
        time_score = 5.0
    else:
        time_score = 6.0

    space_score = 9.0 if detected_space == expected_space else 7.0
    edge_case_score = round(correctness_score * 0.95, 1)
    code_quality_score = 8.5 if len(code.splitlines()) > 4 and ("//" in code or "#" in code) else 7.5

    final_score = round(
        (0.40 * correctness_score) +
        (0.20 * time_score) +
        (0.15 * space_score) +
        (0.15 * edge_case_score) +
        (0.10 * code_quality_score),
        1
    )

    quality_feedback = []
    lang_label = language.upper()
    if correctness_score >= 9.0:
        quality_feedback.append(f"Passed all boundary and hidden stress test cases in {lang_label}.")
    else:
        quality_feedback.append(f"Passed {tests_passed}/{total_tests} test cases in {lang_label}. Review boundary conditions.")

    if detected_time != expected_time:
        quality_feedback.append(
            f"Asymptotic mismatch: Detected {detected_time} while optimal solution is {expected_time}. "
            f"Consider using hashing or two pointers to reduce loop nesting."
        )
    else:
        quality_feedback.append(f"Optimal time complexity achieved in {lang_label}: {detected_time}.")

    return {
        "tests_passed": tests_passed,
        "total_tests": total_tests,
        "correctness_score": correctness_score,
        "time_complexity_score": time_score,
        "space_complexity_score": space_score,
        "edge_case_score": edge_case_score,
        "code_quality_score": code_quality_score,
        "final_coding_score": final_score,
        "detected_time_complexity": detected_time,
        "expected_time_complexity": expected_time,
        "detected_space_complexity": detected_space,
        "expected_space_complexity": expected_space,
        "complexity_explanation": comp_detail,
        "code_quality_feedback": quality_feedback,
        "execution_details": exec_res
    }
