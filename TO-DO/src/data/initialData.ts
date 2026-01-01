import { Course } from '@/types';

export const INITIAL_DATA: Course[] = [
    {
        id: "diff-eq",
        code: "285",
        title: "Differential Equations",
        color: "bg-blue-500",
        customColor: "#3b82f6",
        bgGradient: "from-blue-500 to-cyan-400",
        exams: [
            { id: "285-vize2", title: "Midterm 2", date: "2025-12-15", time: "15:20-16:50" },
            { id: "285-final", title: "Final", date: "2026-01-06", time: "13:30-15:00" }
        ],
        lectureNotes: [],
        units: [
            {
                title: "1. Basic Definitions (pages 1–2)",
                tasks: [
                    { id: "285-1-1", text: "Understand the differential equation concept" },
                    { id: "285-1-2", text: "Review independent and dependent variables" },
                    { id: "285-1-3", text: "Grasp the goal: finding solutions for the equation" }
                ]
            },
            {
                title: "2. Classification of Differential Equations (pages 2–3)",
                tasks: [
                    { id: "285-2-1", text: "Ordinary vs Partial Differential Equations" },
                    { id: "285-2-2", text: "Linear vs Nonlinear Differential Equations" },
                    { id: "285-2-3", text: "Constant vs Variable coefficients" },
                    { id: "285-2-4", text: "Determine the order of a differential equation" }
                ]
            },
            {
                title: "3. Mathematical Modelling (pages 3–5)",
                tasks: [
                    { id: "285-3-1", text: "Newton's Law of Cooling formulation" },
                    { id: "285-3-2", text: "Torricelli's Law of Draining" },
                    { id: "285-3-3", text: "Population models with constant birth/death rates" },
                    { id: "285-3-4", text: "Convert physical models into differential equation form" }
                ]
            },
            {
                title: "4. Solution Types & Initial Value Problems (pages 5–8)",
                tasks: [
                    { id: "285-4-1", text: "Distinguish between general and particular solutions" },
                    { id: "285-4-2", text: "Study initial value problem (IVP) steps" },
                    { id: "285-4-3", text: "Learn existence and uniqueness theorem for DEs" },
                    { id: "285-4-4", text: "Understand solution pattern for 1st order IVP" }
                ]
            },
            {
                title: "5. Slope Fields and Isoclines (pages 8–9)",
                tasks: [
                    { id: "285-5-1", text: "Visualize solution behavior with slope fields" },
                    { id: "285-5-2", text: "Understand isoclines concept" },
                    { id: "285-5-3", text: "Study solution curves through slope fields" }
                ]
            },
            {
                title: "6. First Order Differential Equations (pages 9–23)",
                tasks: [
                    { id: "285-6-1", text: "Separable equations: structure and solution algorithm" },
                    { id: "285-6-2", text: "Linear equations: integrating factor method" },
                    { id: "285-6-3", text: "Homogeneous equations: substitution y=vx" },
                    { id: "285-6-4", text: "Bernoulli equations: reduction process, transformation" },
                    { id: "285-6-5", text: "Exact equations: test for exactness, general solution form" }
                ]
            },
            {
                title: "7. Substitution Methods (pages 15–17)",
                tasks: [
                    { id: "285-7-1", text: "Master substitution techniques for nonseparable cases" },
                    { id: "285-7-2", text: "Practice variable changes for simplification" }
                ]
            },
            {
                title: "8. Numerical Methods (pages 24–31)",
                tasks: [
                    { id: "285-8-1", text: "Euler Method: Explore basic Euler steps for IVP approximation" },
                    { id: "285-8-2", text: "Euler Method: Calculate error estimation for Euler solutions" },
                    { id: "285-8-3", text: "Improved Euler (Heun's) Method: Learn two-slope prediction-correction formula" },
                    { id: "285-8-4", text: "Improved Euler: Implement stepwise table for result comparison" },
                    { id: "285-8-5", text: "Taylor Series Method: Apply Taylor series expansion for numerical solution" },
                    { id: "285-8-6", text: "Taylor Series Method: Understand truncation error and order concept" },
                    { id: "285-8-7", text: "Runge-Kutta (4th order): Study formula and algorithm" },
                    { id: "285-8-8", text: "Runge-Kutta: Compare RK accuracy with Euler and Taylor methods" }
                ]
            },
            {
                title: "9. Second and Higher Order Equations (pages 32–38)",
                tasks: [
                    { id: "285-9-1", text: "Classification: Homogeneous vs Nonhomogeneous" },
                    { id: "285-9-2", text: "Distinct Real Roots: Solve characteristic equation" },
                    { id: "285-9-3", text: "Repeated Real Roots: Handle repeated roots and general solutions" },
                    { id: "285-9-4", text: "Complex Conjugate Roots: Solve using Euler's formula" },
                    { id: "285-9-5", text: "Linearly independent solution construction" },
                    { id: "285-9-6", text: "Compute the Wronskian for independence checking" }
                ]
            },
            {
                title: "10. Methods for Nonhomogeneous Equations (pages 38–52)",
                tasks: [
                    { id: "285-10-1", text: "Undetermined Coefficients: Polynomial forcing terms" },
                    { id: "285-10-2", text: "Undetermined Coefficients: Exponential forcing terms" },
                    { id: "285-10-3", text: "Undetermined Coefficients: Trigonometric forcing terms" },
                    { id: "285-10-4", text: "Variation of Parameters: General solution construction" },
                    { id: "285-10-5", text: "Inverse Operators: Process for particular solution finding" }
                ]
            },
            {
                title: "11. Laplace Transform Applications (pages 53–62)",
                tasks: [
                    { id: "285-11-1", text: "Laplace transform definition and properties" },
                    { id: "285-11-2", text: "Study common Laplace transform pairs" },
                    { id: "285-11-3", text: "Usage in IVP solving" },
                    { id: "285-11-4", text: "Convolution theorem" },
                    { id: "285-11-5", text: "Inverse Laplace transformation steps" }
                ]
            },
            {
                title: "12. RLC Circuit Modeling (pages 70–71)",
                tasks: [
                    { id: "285-12-1", text: "Formulate RLC circuit equations with DEs" },
                    { id: "285-12-2", text: "Voltage-current-capacitance relationships" },
                    { id: "285-12-3", text: "Apply DE solution methods to find circuit behavior" }
                ]
            },
            {
                title: "13. Boundary Value Problems (BVP) (pages 71–72)",
                tasks: [
                    { id: "285-13-1", text: "Difference between IVP and BVP" },
                    { id: "285-13-2", text: "Analyze solution existence and multiplicity" },
                    { id: "285-13-3", text: "Study boundary condition types" }
                ]
            },
            {
                title: "14. Eigenvalues and Eigenfunctions",
                tasks: [
                    { id: "285-14-1", text: "Setup and solve eigenvalue problems" },
                    { id: "285-14-2", text: "Find corresponding eigenfunctions for BVP" }
                ]
            }
        ]
    },
    {
        id: "logical-design",
        code: "241",
        title: "Logical Design",
        color: "bg-indigo-500",
        customColor: "#6366f1",
        bgGradient: "from-indigo-500 to-purple-500",
        exams: [
            { id: "241-vize2", title: "Midterm 2", date: "2025-12-19", time: "15:20-16:50" },
            { id: "241-final", title: "Final", date: "2026-01-02", time: "13:30-15:00" }
        ],
        lectureNotes: [],
        units: [
            {
                title: "Unit 1: Fundamentals and Number Systems (Pages 1-47)",
                tasks: [
                    { id: "241-1-1", text: "Review course objectives and content", initialChecked: true },
                    { id: "241-1-2", text: "Learn differences between Digital and Analog systems", initialChecked: true },
                    { id: "241-1-3", text: "Understand Digitalization (ADC/DAC) concepts", initialChecked: true },
                    { id: "241-1-4", text: "Learn Binary system representation with voltage and noise effects", initialChecked: true },
                    { id: "241-1-5", text: "Grasp the logic of Weighted (positional) number systems", initialChecked: true },
                    { id: "241-1-6", text: "Learn Radix (Base), MSD, LSD and fractional number representations", initialChecked: true },
                    { id: "241-1-7", text: "Practice Binary (Base-2) system", initialChecked: true },
                    { id: "241-1-8", text: "Practice Octal (Base-8) system", initialChecked: true },
                    { id: "241-1-9", text: "Practice Hexadecimal (Base-16) system", initialChecked: true },
                    { id: "241-1-10", text: "Learn 2^n tables and important properties like r^n - 1", initialChecked: true },
                    { id: "241-1-11", text: "Practice conversions from different bases (2, 8, 16) to decimal (base 10)", initialChecked: true }
                ]
            },
            {
                title: "Unit 2: Base Conversions and Binary Arithmetic (Pages 48-77)",
                tasks: [
                    { id: "241-2-1", text: "Learn Decimal integer conversion to other bases using division method", initialChecked: true },
                    { id: "241-2-2", text: "Learn Decimal fractional number conversion using multiplication method", initialChecked: true },
                    { id: "241-2-3", text: "Learn Binary → Octal conversion (3-bit grouping)", initialChecked: true },
                    { id: "241-2-4", text: "Learn Binary → Hexadecimal conversion (4-bit grouping)", initialChecked: true },
                    { id: "241-2-5", text: "Practice fast conversions between Hexadecimal ↔ Octal", initialChecked: true },
                    { id: "241-2-6", text: "Understand general base conversion method", initialChecked: true },
                    { id: "241-2-7", text: "Practice Binary addition operation", initialChecked: true },
                    { id: "241-2-8", text: "Learn Binary subtraction and borrow concept", initialChecked: true },
                    { id: "241-2-9", text: "Practice Binary multiplication operation", initialChecked: true },
                    { id: "241-2-10", text: "Practice Hexadecimal addition operation", initialChecked: true },
                    { id: "241-2-11", text: "Practice Octal multiplication operation", initialChecked: true }
                ]
            },
            {
                title: "Unit 3: Signed Numbers and Binary Codes (Pages 78-145)",
                tasks: [
                    { id: "241-3-1", text: "Learn Register concept and Signed/Unsigned numbers", initialChecked: true },
                    { id: "241-3-2", text: "Learn Sign-Magnitude representation", initialChecked: true },
                    { id: "241-3-3", text: "Understand the logic of Complement representation", initialChecked: true },
                    { id: "241-3-4", text: "Learn 1's Complement definition and arithmetic (end-around carry)", initialChecked: true },
                    { id: "241-3-5", text: "Learn 2's Complement definition and arithmetic (end carry discard)", initialChecked: true },
                    { id: "241-3-6", text: "Practice subtraction using 2's complement (M-N)", initialChecked: true },
                    { id: "241-3-7", text: "Learn Overflow condition in signed numbers and detection methods", initialChecked: true },
                    { id: "241-3-8", text: "Learn Arithmetic Shift operations (left/right)", initialChecked: true },
                    { id: "241-3-9", text: "Learn 9's and 10's complement (Decimal complement) concepts", initialChecked: true },
                    { id: "241-3-10", text: "Learn BCD (Binary Coded Decimal) code and 4-bit representation", initialChecked: true },
                    { id: "241-3-11", text: "Learn BCD addition and invalid code (+6 addition) rule", initialChecked: true },
                    { id: "241-3-12", text: "Understand Gray Code structure (consecutive single bit change)", initialChecked: true },
                    { id: "241-3-13", text: "Learn ASCII Character Code for text representation", initialChecked: true },
                    { id: "241-3-14", text: "Learn Parity Bit (Odd/Even) error detection concept", initialChecked: true }
                ]
            },
            {
                title: "Unit 4: Boolean Algebra and Logic Gates (Pages 146-179)",
                tasks: [
                    { id: "241-4-1", text: "Learn basic logic gates (AND, OR, NOT) and truth tables", initialChecked: true },
                    { id: "241-4-2", text: "Review Boolean Algebra postulates and fundamental theorems", initialChecked: true },
                    { id: "241-4-3", text: "Learn operator precedence order (Parenthesis > NOT > AND > OR)", initialChecked: true },
                    { id: "241-4-4", text: "Understand Duality Principle", initialChecked: true },
                    { id: "241-4-5", text: "Learn Absorption rule (X + XY = X)", initialChecked: true },
                    { id: "241-4-6", text: "Memorize DeMorgan's Theorem", initialChecked: true },
                    { id: "241-4-7", text: "Practice algebraic simplification of Boolean expressions", initialChecked: true },
                    { id: "241-4-8", text: "Learn how to find the Complement (F') of a function", initialChecked: true }
                ]
            },
            {
                title: "Unit 5: Combinational Logic Design (Pages 180-210)",
                tasks: [
                    { id: "241-5-1", text: "Learn Minterm (m_i) concept (product term that makes function 1)", initialChecked: true },
                    { id: "241-5-2", text: "Learn Maxterm (M_i) concept (sum term that makes function 0)", initialChecked: true },
                    { id: "241-5-3", text: "Understand relationship between Minterm and Maxterm (m_i' = M_i)", initialChecked: true },
                    { id: "241-5-4", text: "Learn how to extract Minterm Sum (SOP - Σm) from truth table", initialChecked: true },
                    { id: "241-5-5", text: "Learn how to extract Maxterm Product (POS - ΠM) from truth table", initialChecked: true },
                    { id: "241-5-6", text: "Learn difference between Canonical and Standard forms", initialChecked: true },
                    { id: "241-5-7", text: "Learn algebraic transformation between SOP and POS forms", initialChecked: true },
                    { id: "241-5-8", text: "Learn how to draw SOP form (AND-OR) as two-level circuit", initialChecked: true },
                    { id: "241-5-9", text: "Understand Propagation Delay concept", initialChecked: true },
                    { id: "241-5-10", text: "Learn Tri-State Gates (0, 1, High-Z)", initialChecked: true }
                ]
            },
            {
                title: "Unit 6: Other Gates and Karnaugh Maps (Pages 211-274)",
                tasks: [
                    { id: "241-6-1", text: "Understand that NAND and NOR gates are Universal Gates", initialChecked: true },
                    { id: "241-6-2", text: "Learn how to draw other gates using only NAND", initialChecked: true },
                    { id: "241-6-3", text: "Learn how to draw other gates using only NOR", initialChecked: true },
                    { id: "241-6-4", text: "Learn truth tables and properties of XOR and XNOR gates", initialChecked: true },
                    { id: "241-6-5", text: "Understand logic of Multiple Input gates", initialChecked: true },
                    { id: "241-6-6", text: "Learn fundamentals of Karnaugh Map (K-Map) simplification method", initialChecked: true },
                    { id: "241-6-7", text: "Learn how to create 2-Variable and 3-Variable K-Map", initialChecked: true },
                    { id: "241-6-8", text: "Learn how to create 4-Variable K-Map and corner/edge adjacencies", initialChecked: true },
                    { id: "241-6-9", text: "Learn rules for grouping 1's in sizes 2^n (1, 2, 4, 8...)", initialChecked: true },
                    { id: "241-6-10", text: "Learn how to create larger groups using Don't Cares ('x')", initialChecked: true },
                    { id: "241-6-11", text: "Learn definitions of Implicant, Prime Implicant (PI) and Essential PI (EPI)", initialChecked: true },
                    { id: "241-6-12", text: "Understand 5-Variable K-Map logic (two 4x4 maps)", initialChecked: true },
                    { id: "241-6-13", text: "Learn how to find minimum POS by grouping 0's on K-Map", initialChecked: true }
                ]
            },
            {
                title: "Unit 7: Combinational Circuit Analysis and Design (Pages 321-336)",
                tasks: [
                    { id: "241-7-1", text: "Learn definition of Combinational circuits (no feedback, no memory)" },
                    { id: "241-7-2", text: "Learn analysis methods (Boolean expression and Truth table)" },
                    { id: "241-7-3", text: "Understand Design procedure (Problem → Table → Simplify → Circuit)" },
                    { id: "241-7-4", text: "Study BCD to Excess-3 code converter circuit" },
                    { id: "241-7-5", text: "Learn how to create truth table for Seven-Segment Decoder" }
                ]
            },
            {
                title: "Unit 8: Arithmetic Circuits (Pages 337-362)",
                tasks: [
                    { id: "241-8-1", text: "Learn Half Adder circuit and equations (S = x ⊕ y, C = xy)" },
                    { id: "241-8-2", text: "Learn Full Adder circuit structure and equations" },
                    { id: "241-8-3", text: "Study Parallel Adder and carry propagation delay" },
                    { id: "241-8-4", text: "Learn Carry Look-ahead Adder concept" },
                    { id: "241-8-5", text: "Study BCD Adder design" },
                    { id: "241-8-6", text: "Learn Binary Subtractor circuit (using 2's complement)" },
                    { id: "241-8-7", text: "Study Combined Adder/Subtractor circuit" },
                    { id: "241-8-8", text: "Learn Overflow detection method (V = C_n ⊕ C_{n-1})" }
                ]
            },
            {
                title: "Unit 9: MSI Components (Pages 363-388)",
                tasks: [
                    { id: "241-9-1", text: "Understand Binary Multiplier circuit and partial products" },
                    { id: "241-9-2", text: "Study Magnitude Comparator circuit design" },
                    { id: "241-9-3", text: "Learn Decoder structure and operation" },
                    { id: "241-9-4", text: "Study Decoder Expansion and Enable input" },
                    { id: "241-9-5", text: "Learn circuit design using Decoder and OR gates" },
                    { id: "241-9-6", text: "Learn Encoder structure and Priority Encoder concept" }
                ]
            },
            {
                title: "Unit 10: Multiplexers (MUX) and Tri-State Gates (Pages 389-418)",
                tasks: [
                    { id: "241-10-1", text: "Learn Multiplexer (MUX) structure and function of select lines" },
                    { id: "241-10-2", text: "Learn how to draw MUX internal structure" },
                    { id: "241-10-3", text: "Study Quad 2-to-1 MUX design" },
                    { id: "241-10-4", text: "Learn Boolean function implementation using MUX" },
                    { id: "241-10-5", text: "Study DeMultiplexer (DeMUX) structure" },
                    { id: "241-10-6", text: "Learn Tri-State buffers and High Impedance (Hi-Z) state" }
                ]
            },
            {
                title: "Unit 11: Hardware Description Languages (HDL - Verilog) (Pages 419-432)",
                tasks: [
                    { id: "241-11-1", text: "Learn HDL concept and module structure (module, endmodule)" },
                    { id: "241-11-2", text: "Study Gate-Level modeling in Verilog" },
                    { id: "241-11-3", text: "Understand Design methodologies (Top-down, Bottom-up)" },
                    { id: "241-11-4", text: "Learn Tri-State gates Verilog modeling" },
                    { id: "241-11-5", text: "Study Dataflow modeling (assign statement)" },
                    { id: "241-11-6", text: "Study Behavioral modeling (always block)" },
                    { id: "241-11-7", text: "Understand Test Bench creation and simulation timing (#10)" }
                ]
            }
        ]
    },
    {
        id: "probability",
        code: "283",
        title: "Probability",
        color: "bg-emerald-500",
        customColor: "#10b981",
        bgGradient: "from-emerald-500 to-teal-500",
        exams: [
            { id: "283-vize2", title: "Midterm 2", date: "2025-12-09", time: "13:30-15:00" },
            { id: "283-final", title: "Final", date: "2026-01-05", time: "10:00-12:00" }
        ],
        lectureNotes: [],
        units: [
            {
                title: "Module 1: Fundamentals of Probability (Lectures 1-2)",
                tasks: [
                    { id: "283-1-1", text: "Understand applications of probability", initialChecked: true },
                    { id: "283-1-2", text: "Set Theory: Basic concepts", initialChecked: true },
                    { id: "283-1-3", text: "Set Operations (Union, Intersection...)", initialChecked: true },
                    { id: "283-1-4", text: "Venn Diagrams", initialChecked: true },
                    { id: "283-1-5", text: "De Morgan's and Distributive Laws", initialChecked: true },
                    { id: "283-1-6", text: "Random Experiment and Event concepts", initialChecked: true },
                    { id: "283-1-7", text: "Axioms of Probability", initialChecked: true },
                    { id: "283-1-8", text: "Basic Properties of Probability", initialChecked: true },
                    { id: "283-1-9", text: "Classical Definition of Probability", initialChecked: true },
                    { id: "283-1-10", text: "Conditional Probability Definition", initialChecked: true },
                    { id: "283-1-11", text: "Multiplication Rule", initialChecked: true },
                    { id: "283-1-12", text: "Total Probability Theorem", initialChecked: true },
                    { id: "283-1-13", text: "Bayes' Rule", initialChecked: true },
                    { id: "283-1-14", text: "Independent Events", initialChecked: true }
                ]
            },
            {
                title: "Module 2: Random Variables and Distributions (Lectures 3-4)",
                tasks: [
                    { id: "283-2-1", text: "Problem Session: Schaum's Problems" },
                    { id: "283-2-2", text: "HOMEWORK: Schaum's Chapter 1 solutions" },
                    { id: "283-2-3", text: "Random Variables (RV) Definition" },
                    { id: "283-2-4", text: "Discrete vs Continuous RV" },
                    { id: "283-2-5", text: "Cumulative Distribution Function (CDF)" },
                    { id: "283-2-6", text: "Probability Mass Function (PMF)" },
                    { id: "283-2-7", text: "PMF and CDF relationship" },
                    { id: "283-2-8", text: "Definition: A function that assigns numerical value to each outcome" },
                    { id: "283-2-9", text: "Defining events from RV: (X=x), (X ≤ x), (x1 < X ≤ x2)" },
                    { id: "283-2-10", text: "CDF Properties (ranges from 0 to 1, non-decreasing, right-continuous)" },
                    { id: "283-2-11", text: "CDF for Discrete RV's (staircase shape)" },
                    { id: "283-2-12", text: "Finding probability using CDF: P(a < X ≤ b) = F_X(b) - F_X(a)" },
                    { id: "283-2-13", text: "PMF Properties (sum of p_X(x_k) = 1)" },
                    { id: "283-2-14", text: "Transition from PMF to CDF: F_X(x) = sum of p_X(x_k)" }
                ]
            },
            {
                title: "Module 3: Continuous RV's and Special Distributions (Lectures 5-6)",
                tasks: [
                    { id: "283-3-1", text: "Probability Density Function (PDF) definition" },
                    { id: "283-3-2", text: "PDF Properties: f_X(x) ≥ 0 and integral of f_X(x) dx = 1" },
                    { id: "283-3-3", text: "Probability Calculation: P(a < X ≤ b) = integral from a to b" },
                    { id: "283-3-4", text: "PDF ↔ CDF relationship: F_X(x) = integral and f_X(x) = dF_X(x)/dx" },
                    { id: "283-3-5", text: "Expected Value (Mean) for Discrete: μ_X = sum of x_k p_X(x_k)" },
                    { id: "283-3-6", text: "Expected Value (Mean) for Continuous: μ_X = integral of x f_X(x) dx" },
                    { id: "283-3-7", text: "Variance definition: σ_X² = E[(X - μ_X)²]" },
                    { id: "283-3-8", text: "Variance calculation formula: σ_X² = E[X²] - (E[X])²" },
                    { id: "283-3-9", text: "Standard Deviation: σ_X = sqrt(Var(X))" },
                    { id: "283-3-10", text: "Bernoulli Distribution: PMF, Mean, Variance" },
                    { id: "283-3-11", text: "Binomial Distribution: PMF, Mean, Variance" },
                    { id: "283-3-12", text: "Geometric Distribution: PMF, Mean, Variance" },
                    { id: "283-3-13", text: "Poisson Distribution: PMF, Mean, Variance" },
                    { id: "283-3-14", text: "Uniform Distribution: PDF, CDF, Mean, Variance" },
                    { id: "283-3-15", text: "Exponential Distribution: PDF, CDF, Mean, Variance" },
                    { id: "283-3-16", text: "Normal (Gaussian) Distribution: PDF formula, Standard Normal" }
                ]
            },
            {
                title: "Module 4: Multiple Random Variables (Lecture 8)",
                tasks: [
                    { id: "283-4-1", text: "Bivariate RV (X, Y) definition" },
                    { id: "283-4-2", text: "Joint CDF: F_XY(x, y) = P(X ≤ x, Y ≤ y)" },
                    { id: "283-4-3", text: "Marginal CDF: F_X(x) = F_XY(x, ∞)" },
                    { id: "283-4-4", text: "Joint PMF: p_XY(x_i, y_j) = P(X = x_i, Y = y_j)" },
                    { id: "283-4-5", text: "Marginal PMF: p_X(x_i) = sum of p_XY(x_i, y_j)" },
                    { id: "283-4-6", text: "Joint PDF: f_XY(x, y) = ∂²F_XY(x, y)/∂x∂y" },
                    { id: "283-4-7", text: "Marginal PDF: f_X(x) = integral of f_XY(x, y) dy" },
                    { id: "283-4-8", text: "Independent Random Variables: F_XY(x, y) = F_X(x) F_Y(y)" },
                    { id: "283-4-9", text: "Covariance: Cov(X,Y) = E[XY] - E[X]E[Y]" },
                    { id: "283-4-10", text: "Correlation Coefficient: ρ_XY = Cov(X,Y)/(σ_X σ_Y)" }
                ]
            },
            {
                title: "Module 5: Functions of Random Variables (Lectures 10-11)",
                tasks: [
                    { id: "283-5-1", text: "Single RV Function Y = g(X): Finding CDF and PDF" },
                    { id: "283-5-2", text: "PDF for monotonic functions: f_Y(y) = f_X(x)|dx/dy|" },
                    { id: "283-5-3", text: "Example: Y = aX + b transformation" },
                    { id: "283-5-4", text: "Example: Y = X² transformation" },
                    { id: "283-5-5", text: "Function of Two RV's: Z = g(X,Y)" },
                    { id: "283-5-6", text: "Z = X + Y (Convolution for independent RV's)" },
                    { id: "283-5-7", text: "Jacobian Method for joint PDF transformation" },
                    { id: "283-5-8", text: "Linearity of Expected Value: E[aX + bY] = aE[X] + bE[Y]" },
                    { id: "283-5-9", text: "Variance Formula: Var(aX + bY)" },
                    { id: "283-5-10", text: "Probability Generating Function (PGF)" },
                    { id: "283-5-11", text: "Moment Generating Function (MGF)" },
                    { id: "283-5-12", text: "Characteristic Function" }
                ]
            }
        ]
    },
    {
        id: "circuit-analysis",
        code: "201",
        title: "Circuit Analysis",
        color: "bg-orange-500",
        customColor: "#f97316",
        bgGradient: "from-orange-500 to-amber-500",
        exams: [
            { id: "201-vize2", title: "Midterm 2", date: "2025-12-11", time: "10:20-11:50" },
            { id: "201-final", title: "Final", date: "2026-01-02", time: "13:30-15:00" }
        ],
        lectureNotes: [],
        units: [
            {
                title: "Chapter 1: Fundamentals and Circuit Laws",
                tasks: [
                    { id: "201-1-1", text: "Ideal Basic Circuit Elements (R, V, I)" },
                    { id: "201-1-2", text: "Independent and Dependent Sources & Power Balance" },
                    { id: "201-1-3", text: "Ohm's Law, KVL and KCL" },
                    { id: "201-1-4", text: "Series/Parallel Resistors and Equivalent Resistance" },
                    { id: "201-1-5", text: "Voltage Divider and Current Divider Equations" },
                    { id: "201-1-6", text: "Wye-Delta (Y-Δ) Transformation" }
                ]
            },
            {
                title: "Chapter 2: Circuit Analysis Methods",
                tasks: [
                    { id: "201-2-1", text: "Node-Voltage Method (KCL at each node)" },
                    { id: "201-2-2", text: "Supernode concept (voltage source between two nodes)" },
                    { id: "201-2-3", text: "Mesh-Current Method (KVL at each mesh)" },
                    { id: "201-2-4", text: "Supermesh concept (current source in a mesh)" },
                    { id: "201-2-5", text: "Circuit Analysis with Dependent Sources" }
                ]
            },
            {
                title: "Chapter 3: Circuit Theorems",
                tasks: [
                    { id: "201-3-1", text: "Source Transformation (V_s and R_s ↔ I_s and R_s)" },
                    { id: "201-3-2", text: "Thevenin's Theorem: Model circuit as V_TH and R_TH" },
                    { id: "201-3-3", text: "Norton's Theorem: Model circuit as I_N and R_N" },
                    { id: "201-3-4", text: "Test Source Method for circuits with dependent sources" },
                    { id: "201-3-5", text: "Maximum Power Transfer: R_L = R_TH" },
                    { id: "201-3-6", text: "Superposition Theorem: Sum effects of each source" }
                ]
            },
            {
                title: "Chapter 4: Operational Amplifiers",
                tasks: [
                    { id: "201-4-1", text: "Ideal Op-Amp Model: Virtual Short Circuit (V+ = V-)" },
                    { id: "201-4-2", text: "Input currents are zero (I+ = I- = 0)" },
                    { id: "201-4-3", text: "Inverting Amplifier Circuit" },
                    { id: "201-4-4", text: "Non-Inverting Amplifier Circuit" },
                    { id: "201-4-5", text: "Summing Amplifier Circuit" },
                    { id: "201-4-6", text: "Difference Amplifier Circuit" },
                    { id: "201-4-7", text: "Op-Amp Saturation Regions" }
                ]
            },
            {
                title: "Chapter 5: Capacitors, Inductors and Transient Analysis",
                tasks: [
                    { id: "201-5-1", text: "Capacitor: i = C dv/dt and stored energy W = (1/2)CV²" },
                    { id: "201-5-2", text: "Inductor: v = L di/dt and stored energy W = (1/2)LI²" },
                    { id: "201-5-3", text: "Under DC: Capacitor = Open Circuit, Inductor = Short Circuit" },
                    { id: "201-5-4", text: "First Order RC Circuit: Natural Response" },
                    { id: "201-5-5", text: "First Order RC Circuit: Step Response" },
                    { id: "201-5-6", text: "First Order RL Circuit: Natural and Step Response" },
                    { id: "201-5-7", text: "Time Constant: τ = RC for RC, τ = L/R for RL" },
                    { id: "201-5-8", text: "General Solution: x(t) = x(∞) + [x(0) - x(∞)]e^(-t/τ)" },
                    { id: "201-5-9", text: "Second Order RLC: Series and Parallel equations" },
                    { id: "201-5-10", text: "Damping Coefficient (α) and Resonance Frequency (ω_0)" },
                    { id: "201-5-11", text: "Overdamped Response: α > ω_0" },
                    { id: "201-5-12", text: "Critically Damped Response: α = ω_0" },
                    { id: "201-5-13", text: "Underdamped / Oscillatory Response: α < ω_0" },
                    { id: "201-5-14", text: "Op-Amp Integrator Circuits" }
                ]
            }
        ]
    },
    {
        id: "signals",
        code: "301",
        title: "Signals and Systems",
        color: "bg-red-500",
        customColor: "#ef4444",
        bgGradient: "from-red-500 to-pink-600",
        exams: [
            { id: "301-vize2", title: "Midterm 2", date: "2025-12-12", time: "08:30-10:00" },
            { id: "301-final", title: "Final", date: "2026-01-07", time: "08:30-10:00" }
        ],
        lectureNotes: [],
        units: [
            {
                title: "1. Introduction and Classification of Signals (pages 4–8)",
                tasks: [
                    { id: "301-1-1", text: "Define Continuous-Time vs. Discrete-Time Signals" },
                    { id: "301-1-2", text: "Distinguish between Analog and Digital Signals" },
                    { id: "301-1-3", text: "Understand Real vs. Complex and Deterministic vs. Random Signals" },
                    { id: "301-1-4", text: "Identify Even and Odd Signals" },
                    { id: "301-1-5", text: "Determine Periodic vs. Nonperiodic Signals" },
                    { id: "301-1-6", text: "Calculate Energy and Power of Signals" }
                ]
            },
            {
                title: "2. Basic Continuous-Time Signals (pages 9–13)",
                tasks: [
                    { id: "301-2-1", text: "Study the Unit Step Function u(t) and its properties" },
                    { id: "301-2-2", text: "Study the Unit Impulse Function δ(t) and delta properties" },
                    { id: "301-2-3", text: "Review Complex Exponential e^(jωt) and Sinusoidal Signals" }
                ]
            },
            {
                title: "3. Basic Discrete-Time Signals (pages 14–18)",
                tasks: [
                    { id: "301-3-1", text: "Study the Unit Step Sequence u[n]" },
                    { id: "301-3-2", text: "Study the Unit Impulse Sequence δ[n]" },
                    { id: "301-3-3", text: "Analyze Complex Exponential and Sinusoidal Sequences" },
                    { id: "301-3-4", text: "Understand Periodicity conditions for discrete exponentials" }
                ]
            },
            {
                title: "4. Signal Manipulations (pages 19–21)",
                tasks: [
                    { id: "301-4-1", text: "Perform Time Shifting x(t-t₀) transformations" },
                    { id: "301-4-2", text: "Perform Time Reversal x(-t) transformations" },
                    { id: "301-4-3", text: "Perform Time Scaling x(at) transformations" },
                    { id: "301-4-4", text: "Understand Amplitude transformations (Addition, Multiplication, Scaling)" }
                ]
            },
            {
                title: "5. Classification of Systems (pages 22–24)",
                tasks: [
                    { id: "301-5-1", text: "Distinguish Memoryless Systems vs. Systems with Memory" },
                    { id: "301-5-2", text: "Analyze Causal vs. Noncausal Systems" },
                    { id: "301-5-3", text: "Check for Linearity (Additivity and Homogeneity)" },
                    { id: "301-5-4", text: "Check for Time-Invariance vs. Time-Varying" },
                    { id: "301-5-5", text: "Determine BIBO Stability" },
                    { id: "301-5-6", text: "Understand Feedback structures" }
                ]
            },
            {
                title: "6. Continuous-Time LTI Systems (pages 36–39)",
                tasks: [
                    { id: "301-6-1", text: "Define Impulse Response h(t)" },
                    { id: "301-6-2", text: "Master the Convolution Integral y(t) = x(t) * h(t)" },
                    { id: "301-6-3", text: "Review Convolution properties (Commutative, Associative, Distributive)" },
                    { id: "301-6-4", text: "Derive Step Response from Impulse Response" },
                    { id: "301-6-5", text: "Determine Causality and Stability from h(t)" }
                ]
            },
            {
                title: "7. Differential and Difference Equations (pages 40–45)",
                tasks: [
                    { id: "301-7-1", text: "Solve Linear Constant-Coefficient Differential Equations" },
                    { id: "301-7-2", text: "Distinguish Zero-Input vs. Zero-State Response" },
                    { id: "301-7-3", text: "Define Impulse Response h[n] for discrete systems" },
                    { id: "301-7-4", text: "Master the Convolution Sum y[n] = x[n] * h[n]" },
                    { id: "301-7-5", text: "Solve Linear Constant-Coefficient Difference Equations" },
                    { id: "301-7-6", text: "Understand Recursive vs. Nonrecursive Systems (FIR vs. IIR)" }
                ]
            },
            {
                title: "8. Laplace Transform (pages 54–69)",
                tasks: [
                    { id: "301-8-1", text: "Define Bilateral Laplace Transform" },
                    { id: "301-8-2", text: "Determine the Region of Convergence (ROC)" },
                    { id: "301-8-3", text: "Sketch Poles and Zeros in the s-plane" },
                    { id: "301-8-4", text: "Master the Properties of the ROC" },
                    { id: "301-8-5", text: "Memorize Common Transform Pairs (Table 3-1)" },
                    { id: "301-8-6", text: "Apply Linearity, Time Shifting, and s-Domain Shifting" },
                    { id: "301-8-7", text: "Apply Time Scaling, Time Reversal" },
                    { id: "301-8-8", text: "Understand Differentiation and Integration properties" },
                    { id: "301-8-9", text: "Apply the Convolution Property" },
                    { id: "301-8-10", text: "Perform Partial-Fraction Expansion (Simple and Multiple Poles)" },
                    { id: "301-8-11", text: "Define System Function H(s) - Transfer function" },
                    { id: "301-8-12", text: "Relate H(s) to Causality and Stability (pole locations)" },
                    { id: "301-8-13", text: "Understand Unilateral Laplace Transform" },
                    { id: "301-8-14", text: "Solve Differential Equations with Initial Conditions" },
                    { id: "301-8-15", text: "Analyze Transform Circuits (R, L, C models)" }
                ]
            },
            {
                title: "9. Z-Transform (pages 86–98)",
                tasks: [
                    { id: "301-9-1", text: "Define Bilateral z-Transform" },
                    { id: "301-9-2", text: "Determine the Region of Convergence (ROC) in z-plane" },
                    { id: "301-9-3", text: "Sketch Poles and Zeros in z-plane" },
                    { id: "301-9-4", text: "Memorize Common z-Transform Pairs (Table 4-1)" },
                    { id: "301-9-5", text: "Apply Linearity, Time Shifting, and Scaling" },
                    { id: "301-9-6", text: "Apply Time Reversal and Differentiation" },
                    { id: "301-9-7", text: "Use Power Series Expansion method" },
                    { id: "301-9-8", text: "Use Partial-Fraction Expansion method" },
                    { id: "301-9-9", text: "Define System Function H(z)" },
                    { id: "301-9-10", text: "Relate H(z) to Causality and Stability (pole analysis)" },
                    { id: "301-9-11", text: "Solve Difference Equations using unilateral transform" }
                ]
            },
            {
                title: "10. Fourier Analysis (pages 107–122)",
                tasks: [
                    { id: "301-10-1", text: "Represent Periodic Signals with Fourier series" },
                    { id: "301-10-2", text: "Calculate Complex Exponential Fourier Series coefficients c_n" },
                    { id: "301-10-3", text: "Understand Trigonometric Fourier Series (a_n and b_n coefficients)" },
                    { id: "301-10-4", text: "Define Fourier Transform X(jω) and Inverse Fourier Transform" },
                    { id: "301-10-5", text: "Check Convergence (Dirichlet Conditions)" },
                    { id: "301-10-6", text: "Relate Fourier Transform to Laplace Transform (s = jω)" },
                    { id: "301-10-7", text: "Apply Linearity, Time Shifting, and Frequency Shifting" },
                    { id: "301-10-8", text: "Apply Time Scaling, Time Reversal, and Duality" },
                    { id: "301-10-9", text: "Understand Convolution and Multiplication (Modulation)" },
                    { id: "301-10-10", text: "Apply Parseval's Relation (Energy conservation)" },
                    { id: "301-10-11", text: "Determine Magnitude and Phase Response" },
                    { id: "301-10-12", text: "Analyze Ideal Filters (Low-Pass, High-Pass, Band-Pass/Stop)" },
                    { id: "301-10-13", text: "Define Absolute Bandwidth" },
                    { id: "301-10-14", text: "Define 3-dB (Half-Power) Bandwidth" }
                ]
            },
            {
                title: "11. Sampling Theorem (pages 123–126)",
                tasks: [
                    { id: "301-11-1", text: "Understand Nyquist Sampling Theorem (fs ≥ 2f_max)" },
                    { id: "301-11-2", text: "Study Sampling Frequency and Aliasing problems" },
                    { id: "301-11-3", text: "Learn Ideal Sampling with impulse train" },
                    { id: "301-11-4", text: "Master Reconstruction of signal from samples" },
                    { id: "301-11-5", text: "Study Practical Sampling (Zero-order hold and reconstruction filters)" }
                ]
            },
            {
                title: "12. Additional Topics",
                tasks: [
                    { id: "301-12-1", text: "Define State Variables" },
                    { id: "301-12-2", text: "Study State Equations: ẋ = Ax + Bu, y = Cx + Du" },
                    { id: "301-12-3", text: "Calculate State Transition Matrix e^(At)" },
                    { id: "301-12-4", text: "Test Controllability and Observability" },
                    { id: "301-12-5", text: "Define N-point DFT" },
                    { id: "301-12-6", text: "Study FFT (Fast Fourier Transform) algorithm" },
                    { id: "301-12-7", text: "Understand DFT Properties (Periodicity, Symmetry)" },
                    { id: "301-12-8", text: "Apply Windowing Techniques (Hamming, Hanning, Blackman)" },
                    { id: "301-12-9", text: "Study Butterworth Filters (maximally flat passband)" },
                    { id: "301-12-10", text: "Study Chebyshev Filters (Type I and Type II)" },
                    { id: "301-12-11", text: "Study Elliptic (Cauer) Filters (optimum design)" },
                    { id: "301-12-12", text: "Study Bessel Filters (linear phase response)" },
                    { id: "301-12-13", text: "Learn FIR Filter Design (window method, frequency sampling)" },
                    { id: "301-12-14", text: "Learn IIR Filter Design (bilinear transformation, impulse invariance)" }
                ]
            }
        ]
    },
    {
        id: "personal",
        code: "PRSNL",
        title: "Personal & Technology",
        color: "bg-gray-800 dark:bg-gray-600",
        customColor: "#475569",
        bgGradient: "from-slate-700 to-slate-900",
        exams: [],
        lectureNotes: [],
        units: [
            {
                title: "AI & Technology",
                tasks: [
                    { id: "p-ai-1", text: "Colab general fundamentals" },
                    { id: "p-ai-2", text: "n8n RSS reading" },
                    { id: "p-ai-3", text: "n8n Twitter automation" },
                    { id: "p-ai-4", text: "Learn Gemini API integration" },
                    { id: "p-ai-5", text: "Research LangChain fundamentals" },
                    { id: "p-ai-6", text: "Microsoft Learn Azure" },
                    { id: "p-ai-7", text: "AWS fundamentals introduction" }
                ]
            },
            {
                title: "Web & Hosting",
                tasks: [
                    { id: "p-web-1", text: "Firebase use database" },
                    { id: "p-web-2", text: "SupaBase use database" },
                    { id: "p-web-3", text: "Buy domain and hosting" },
                    { id: "p-web-4", text: "Create personal website" }
                ]
            },
            {
                title: "System & Infrastructure",
                tasks: [
                    { id: "p-sys-1", text: "Raspberry Pi 5 full module server" },
                    { id: "p-sys-2", text: "Apache2 server installation (VDS/VPS)" }
                ]
            },
            {
                title: "High Priority",
                tasks: [
                    { id: "p-high-1", text: "Open Linktree account" },
                    { id: "p-high-2", text: "Watch Obsidian videos" }
                ]
            },
            {
                title: "Cybersecurity",
                tasks: [
                    { id: "p-sec-1", text: "Cyber Sec Cisco video" },
                    { id: "p-sec-2", text: "OWASP Juice" },
                    { id: "p-sec-3", text: "Static/Dynamic Analysis" },
                    { id: "p-sec-4", text: "SSDLC" }
                ]
            },
            {
                title: "Ideas & Brainstorm",
                tasks: [
                    { id: "p-idea-1", text: "Create YouTube video content" },
                    { id: "p-idea-2", text: "Write articles on Medium" },
                    { id: "p-idea-3", text: "Start podcast series" },
                    { id: "p-idea-4", text: "Create blog" }
                ]
            },
            {
                title: "EEE 285 - Differential Equations Study",
                tasks: [
                    { id: "p-285-1", text: "Memorize Laplace Transform tables" },
                    { id: "p-285-2", text: "Review 2nd Order DE solution methods" },
                    { id: "p-285-3", text: "Practice Numerical Methods (Euler, RK4)" },
                    { id: "p-285-4", text: "Solve past exam questions" },
                    { id: "p-285-5", text: "Schaum's Outline problem solving" }
                ]
            },
            {
                title: "Personal Development",
                tasks: [
                    { id: "p-dev-1", text: "Daily 30 min English practice" },
                    { id: "p-dev-2", text: "Weekly summary and planning" }
                ]
            }
        ]
    }
];

export const INITIAL_COMPLETED_TASK_IDS = INITIAL_DATA.flatMap(course =>
    course.units.flatMap(unit =>
        unit.tasks.filter(task => task.initialChecked).map(task => task.id)
    )
);
