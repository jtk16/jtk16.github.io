// algorithms/algorithm-definitions.js
// Complete definitions for all quantum algorithms

export const AlgorithmDefinitions = {
  'single-qubit': {
    name: 'Single Qubit Gates',
    description: 'Explore the fundamental single-qubit quantum gates and their effects on quantum states. Learn how Pauli gates, Hadamard, and phase gates transform qubit states.',
    category: 'basics',
    qubits: 1,
    difficulty: 'beginner',
    concepts: ['superposition', 'quantum gates', 'Bloch sphere', 'measurement'],
    steps: [
      {
        type: 'gate',
        gate: 'X',
        qubits: [0],
        explanation: 'Apply Pauli-X gate (quantum NOT)',
        description: 'The X gate flips the qubit from |0⟩ to |1⟩ or vice versa. It performs a 180° rotation around the X-axis of the Bloch sphere.',
        math: 'X|0⟩ = |1⟩, X|1⟩ = |0⟩'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Apply Hadamard gate (create superposition)',
        description: 'The Hadamard gate creates an equal superposition of |0⟩ and |1⟩ states. It rotates the state by 180° around the X+Z axis.',
        math: 'H|0⟩ = (|0⟩ + |1⟩)/√2, H|1⟩ = (|0⟩ - |1⟩)/√2'
      },
      {
        type: 'gate',
        gate: 'Z',
        qubits: [0],
        explanation: 'Apply Pauli-Z gate (phase flip)',
        description: 'The Z gate leaves |0⟩ unchanged but flips the phase of |1⟩. It performs a 180° rotation around the Z-axis.',
        math: 'Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩'
      },
      {
        type: 'measure',
        qubits: [0],
        explanation: 'Measure the qubit state',
        description: 'Measurement collapses the quantum superposition to a definite classical state.',
        math: 'P(0) = |α|², P(1) = |β|² for |ψ⟩ = α|0⟩ + β|1⟩'
      }
    ],
    initialState: '|0⟩',
    targetState: 'Various states',
    successMetric: 'Understanding gate effects',
    tips: [
      'Watch how each gate moves the state vector on the Bloch sphere',
      'Notice that X and Z gates are their own inverses: XX = I, ZZ = I',
      'The Hadamard gate creates maximum superposition from basis states'
    ]
  },

  'two-qubit': {
    name: 'Two Qubit Gates',
    description: 'Learn about two-qubit quantum gates, especially the fundamental CNOT gate that creates entanglement between qubits.',
    category: 'basics',
    qubits: 2,
    difficulty: 'beginner',
    concepts: ['entanglement', 'controlled gates', 'two-qubit operations'],
    steps: [
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Put first qubit in superposition',
        description: 'Create superposition on the control qubit to enable entanglement.',
        math: 'H|00⟩ = (|00⟩ + |10⟩)/√2'
      },
      {
        type: 'gate',
        gate: 'CNOT',
        qubits: [0, 1],
        explanation: 'Apply CNOT gate (controlled-X)',
        description: 'The CNOT gate flips the target qubit if the control qubit is |1⟩. This creates entanglement.',
        math: 'CNOT(|00⟩ + |10⟩)/√2 = (|00⟩ + |11⟩)/√2'
      },
      {
        type: 'measure',
        qubits: [0, 1],
        explanation: 'Measure both qubits',
        description: 'Measuring entangled qubits reveals perfect correlation in their outcomes.',
        math: 'Bell state: 50% chance of |00⟩, 50% chance of |11⟩'
      }
    ],
    initialState: '|00⟩',
    targetState: 'Bell state (|00⟩ + |11⟩)/√2',
    successMetric: 'Creating entanglement',
    tips: [
      'CNOT only acts when the control qubit is |1⟩',
      'Entangled states cannot be written as products of individual qubit states',
      'Measuring one qubit instantly determines the other\'s state'
    ]
  },

  'bell-states': {
    name: 'Bell States',
    description: 'Create and explore the four maximally entangled Bell states, the foundation of quantum information protocols.',
    category: 'fundamentals',
    qubits: 2,
    difficulty: 'intermediate',
    concepts: ['Bell states', 'maximal entanglement', 'quantum correlations'],
    steps: [
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Create superposition on first qubit',
        description: 'Initialize the Bell state creation with a Hadamard gate.',
        math: 'H|0⟩ ⊗ |0⟩ = (|0⟩ + |1⟩)/√2 ⊗ |0⟩'
      },
      {
        type: 'gate',
        gate: 'CNOT',
        qubits: [0, 1],
        explanation: 'Create Bell state Φ⁺',
        description: 'CNOT creates the first Bell state: (|00⟩ + |11⟩)/√2',
        math: 'CNOT H|00⟩ = |Φ⁺⟩ = (|00⟩ + |11⟩)/√2'
      },
      {
        type: 'gate',
        gate: 'Z',
        qubits: [0],
        explanation: 'Transform to Φ⁻ (optional)',
        description: 'Applying Z to control creates Φ⁻ = (|00⟩ - |11⟩)/√2',
        math: 'Z|Φ⁺⟩ = |Φ⁻⟩ = (|00⟩ - |11⟩)/√2'
      },
      {
        type: 'measure',
        qubits: [0, 1],
        explanation: 'Measure Bell state',
        description: 'Perfect correlation: measuring |0⟩ on one guarantees |0⟩ on the other.',
        math: 'Always get |00⟩ or |11⟩ with equal probability'
      }
    ],
    initialState: '|00⟩',
    targetState: 'Bell state |Φ⁺⟩',
    successMetric: 'Perfect quantum correlation',
    tips: [
      'Bell states are maximally entangled - they have maximum possible correlation',
      'All four Bell states can be created with different gate combinations',
      'Bell states violate classical correlation limits (Bell\'s theorem)'
    ]
  },

  'deutsch': {
    name: 'Deutsch Algorithm',
    description: 'The first quantum algorithm showing quantum advantage! Determine if a function is constant or balanced with just one evaluation.',
    category: 'algorithms',
    qubits: 2,
    difficulty: 'intermediate',
    concepts: ['quantum parallelism', 'oracle functions', 'quantum advantage'],
    steps: [
      {
        type: 'gate',
        gate: 'X',
        qubits: [1],
        explanation: 'Initialize ancilla qubit to |1⟩',
        description: 'The ancilla qubit must start in |1⟩ to create the proper oracle behavior.',
        math: 'Initialize: |0⟩ ⊗ |1⟩'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [0, 1],
        explanation: 'Apply Hadamard to both qubits',
        description: 'Creates superposition and prepares the oracle input state.',
        math: 'H⊗H|01⟩ = (|0⟩ + |1⟩)/√2 ⊗ (|0⟩ - |1⟩)/√2'
      },
      {
        type: 'oracle',
        gate: 'Oracle',
        qubits: [0, 1],
        explanation: 'Apply function oracle',
        description: 'The oracle encodes f(x) in the phase: |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩',
        math: 'U_f: |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Final Hadamard on control qubit',
        description: 'Extracts the global information about the function.',
        math: 'H creates interference that reveals function type'
      },
      {
        type: 'measure',
        qubits: [0],
        explanation: 'Measure control qubit',
        description: 'Result determines function type: |0⟩ = constant, |1⟩ = balanced',
        math: 'P(0) = 1 if f constant, P(0) = 0 if f balanced'
      }
    ],
    initialState: '|01⟩',
    targetState: '|0⟩ if constant, |1⟩ if balanced',
    successMetric: 'Determine function type in one query',
    tips: [
      'Classical algorithms need 2 queries in worst case, quantum needs only 1',
      'The oracle acts on superposition, evaluating f(0) and f(1) simultaneously',
      'Phase kickback is key: the ancilla transfers information to the control'
    ]
  },

  'grovers': {
    name: "Grover's Search Algorithm",
    description: 'Search an unsorted database quadratically faster than classical algorithms using amplitude amplification.',
    category: 'algorithms',
    qubits: 3,
    difficulty: 'advanced',
    concepts: ['amplitude amplification', 'database search', 'quadratic speedup'],
    steps: [
      {
        type: 'gate',
        gate: 'H',
        qubits: [0, 1, 2],
        explanation: 'Initialize uniform superposition',
        description: 'Create equal superposition of all possible states - the starting point for search.',
        math: 'H⊗3|000⟩ = (1/√8)∑|x⟩ for x ∈ {0,1}³'
      },
      {
        type: 'oracle',
        gate: 'Oracle',
        qubits: [0, 1, 2],
        explanation: 'Mark target state |111⟩',
        description: 'Oracle flips the phase of the target state, making it distinguishable.',
        math: 'O|x⟩ = -|x⟩ if x = target, +|x⟩ otherwise'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [0, 1, 2],
        explanation: 'Begin diffusion operator',
        description: 'First step of diffusion: transform to computational basis.',
        math: 'Apply H⊗3 before amplitude inversion'
      },
      {
        type: 'gate',
        gate: 'X',
        qubits: [0, 1, 2],
        explanation: 'Flip all qubits',
        description: 'Preparation for controlled phase flip around |000⟩ state.',
        math: 'X⊗3: |x⟩ → |x̄⟩ (bitwise NOT)'
      },
      {
        type: 'gate',
        gate: 'CCZ',
        qubits: [0, 1, 2],
        explanation: 'Conditional phase flip',
        description: 'Flips phase when all qubits are |1⟩ (which is |000⟩ after X gates).',
        math: 'CCZ flips phase of |111⟩ state'
      },
      {
        type: 'gate',
        gate: 'X',
        qubits: [0, 1, 2],
        explanation: 'Flip qubits back',
        description: 'Restore original basis after phase manipulation.',
        math: 'X⊗3: |x̄⟩ → |x⟩ (restore original)'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [0, 1, 2],
        explanation: 'Complete diffusion operator',
        description: 'Final Hadamard completes the inversion about average amplitude.',
        math: 'Diffusion: 2|s⟩⟨s| - I where |s⟩ is uniform superposition'
      },
      {
        type: 'measure',
        qubits: [0, 1, 2],
        explanation: 'Measure to find marked state',
        description: 'High probability of measuring the target state |111⟩.',
        math: 'P(target) ≈ sin²((2k+1)θ/2) where θ = 2arcsin(1/√N)'
      }
    ],
    initialState: '|000⟩',
    targetState: '|111⟩',
    successMetric: 'High probability of measuring |111⟩',
    iterations: 2, // For 3 qubits, ~π√8/4 ≈ 2 iterations optimal
    tips: [
      'For N items, Grover\'s algorithm needs ~π√N/4 iterations',
      'Each iteration consists of oracle + diffusion operator',
      'Classical search needs N/2 queries on average, quantum needs √N'
    ]
  },

  'qft': {
    name: 'Quantum Fourier Transform',
    description: 'The quantum analog of the discrete Fourier transform, essential for period finding and Shor\'s algorithm.',
    category: 'algorithms',
    qubits: 3,
    difficulty: 'advanced',
    concepts: ['Fourier transform', 'phase relationships', 'period finding'],
    steps: [
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Apply Hadamard to first qubit',
        description: 'Begin QFT decomposition with Hadamard on most significant qubit.',
        math: 'H|q₀⟩ creates superposition with phase dependencies'
      },
      {
        type: 'gate',
        gate: 'S',
        qubits: [1],
        explanation: 'Controlled-S gate (simplified)',
        description: 'Phase gate controlled by qubit 0 (simplified representation).',
        math: 'CS: adds phase π/2 if control is |1⟩'
      },
      {
        type: 'gate',
        gate: 'T',
        qubits: [2],
        explanation: 'Controlled-T gate (simplified)',
        description: 'T gate controlled by qubit 0 (simplified representation).',
        math: 'CT: adds phase π/4 if control is |1⟩'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [1],
        explanation: 'Apply Hadamard to second qubit',
        description: 'Continue QFT decomposition on second qubit.',
        math: 'Creates frequency domain representation'
      },
      {
        type: 'gate',
        gate: 'S',
        qubits: [2],
        explanation: 'Another controlled phase gate',
        description: 'Phase gate controlled by qubit 1.',
        math: 'Builds up the frequency domain phases'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [2],
        explanation: 'Apply Hadamard to third qubit',
        description: 'Complete the QFT transformation.',
        math: 'Final step in frequency domain conversion'
      },
      {
        type: 'gate',
        gate: 'SWAP',
        qubits: [0, 2],
        explanation: 'Swap qubits to reverse order',
        description: 'QFT conventionally outputs in reversed qubit order.',
        math: 'SWAP corrects the bit order for standard QFT'
      },
      {
        type: 'measure',
        qubits: [0, 1, 2],
        explanation: 'Measure frequency domain state',
        description: 'Result reveals frequency components of input state.',
        math: 'Frequency amplitudes |ck|² = |⟨k|QFT|ψ⟩|²'
      }
    ],
    initialState: '|000⟩',
    targetState: 'Frequency domain representation',
    successMetric: 'Successful frequency domain transformation',
    tips: [
      'QFT is exponentially faster than classical FFT for quantum states',
      'Essential component of Shor\'s algorithm for factoring',
      'Reveals periodic patterns in quantum states'
    ]
  },

  'teleportation': {
    name: 'Quantum Teleportation',
    description: 'Transfer quantum information using entanglement and classical communication - demonstrating quantum non-locality.',
    category: 'protocols',
    qubits: 3,
    difficulty: 'advanced',
    concepts: ['quantum teleportation', 'entanglement', 'no-cloning theorem'],
    steps: [
      {
        type: 'gate',
        gate: 'H',
        qubits: [1],
        explanation: 'Create entangled pair (step 1)',
        description: 'Begin creating Bell state between qubits 1 and 2.',
        math: 'H|0⟩ = (|0⟩ + |1⟩)/√2'
      },
      {
        type: 'gate',
        gate: 'CNOT',
        qubits: [1, 2],
        explanation: 'Create entangled pair (step 2)',
        description: 'Complete Bell state creation: (|00⟩ + |11⟩)/√2',
        math: 'Bell state shared between Alice and Bob'
      },
      {
        type: 'gate',
        gate: 'CNOT',
        qubits: [0, 1],
        explanation: 'Entangle state with Alice\'s qubit',
        description: 'Entangle the unknown state (qubit 0) with Alice\'s part of Bell pair.',
        math: 'Creates three-qubit entangled state'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Prepare for Bell measurement',
        description: 'Hadamard prepares qubit 0 for Bell basis measurement.',
        math: 'Projects onto Bell basis for measurement'
      },
      {
        type: 'measure',
        qubits: [0, 1],
        explanation: 'Alice measures in Bell basis',
        description: 'Alice\'s measurement determines correction needed at Bob\'s end.',
        math: 'Four possible outcomes determine Bob\'s correction'
      },
      {
        type: 'gate',
        gate: 'X',
        qubits: [2],
        explanation: 'Bob applies X correction (conditional)',
        description: 'Based on Alice\'s measurement result, Bob may apply X gate.',
        math: 'X correction if Alice measured |1⟩ on first qubit'
      },
      {
        type: 'gate',
        gate: 'Z',
        qubits: [2],
        explanation: 'Bob applies Z correction (conditional)',
        description: 'Based on Alice\'s measurement, Bob may apply Z gate.',
        math: 'Z correction if Alice measured |1⟩ on second qubit'
      },
      {
        type: 'measure',
        qubits: [2],
        explanation: 'Verify teleportation success',
        description: 'Bob\'s qubit now contains the original unknown state.',
        math: 'Bob\'s state = original state from qubit 0'
      }
    ],
    initialState: '|ψ⟩|00⟩ (unknown state + Bell pair)',
    targetState: '|00⟩|ψ⟩ (state teleported to Bob)',
    successMetric: 'Perfect state transfer',
    tips: [
      'The original state is destroyed during measurement (no-cloning)',
      'Classical communication is required to complete the protocol',
      'Demonstrates that quantum information is not bound to specific particles'
    ]
  },

  'superdense-coding': {
    name: 'Superdense Coding',
    description: 'Send two classical bits using one qubit and shared entanglement - demonstrating quantum communication advantage.',
    category: 'protocols',
    qubits: 2,
    difficulty: 'intermediate',
    concepts: ['superdense coding', 'entanglement', 'classical communication'],
    steps: [
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Create entangled pair',
        description: 'Alice and Bob share entangled Bell state.',
        math: 'H|0⟩ ⊗ |0⟩ → (|00⟩ + |10⟩)/√2'
      },
      {
        type: 'gate',
        gate: 'CNOT',
        qubits: [0, 1],
        explanation: 'Complete Bell state',
        description: 'Creates |Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
        math: 'Shared entanglement between Alice and Bob'
      },
      {
        type: 'gate',
        gate: 'Z',
        qubits: [0],
        explanation: 'Encode bit 1 (optional)',
        description: 'Alice applies Z if she wants to send "1" as first bit.',
        math: 'Z|Φ⁺⟩ → |Φ⁻⟩ = (|00⟩ - |11⟩)/√2'
      },
      {
        type: 'gate',
        gate: 'X',
        qubits: [0],
        explanation: 'Encode bit 2 (optional)',
        description: 'Alice applies X if she wants to send "1" as second bit.',
        math: 'Four possible states encode 00, 01, 10, 11'
      },
      {
        type: 'gate',
        gate: 'CNOT',
        qubits: [0, 1],
        explanation: 'Begin Bell measurement',
        description: 'Bob starts Bell basis measurement to decode message.',
        math: 'Reverse the entanglement creation'
      },
      {
        type: 'gate',
        gate: 'H',
        qubits: [0],
        explanation: 'Complete Bell measurement',
        description: 'Complete transformation to computational basis.',
        math: 'Projects to |00⟩, |01⟩, |10⟩, or |11⟩'
      },
      {
        type: 'measure',
        qubits: [0, 1],
        explanation: 'Decode two classical bits',
        description: 'Measurement result reveals Alice\'s two-bit message.',
        math: 'Four measurement outcomes correspond to 2-bit messages'
      }
    ],
    initialState: '|00⟩',
    targetState: 'One of four Bell states',
    successMetric: 'Send 2 bits with 1 qubit + entanglement',
    tips: [
      'Requires pre-shared entanglement between Alice and Bob',
      'Classical capacity is 2 bits per qubit (double normal capacity)',
      'Demonstrates how entanglement enhances communication'
    ]
  },

  'phase-estimation': {
    name: 'Quantum Phase Estimation',
    description: 'Estimate the phase of an eigenvalue with exponential precision - core subroutine for many quantum algorithms.',
    category: 'subroutines',
    qubits: 4,
    difficulty: 'expert',
    concepts: ['phase estimation', 'eigenvalues', 'controlled unitaries'],
    steps: [
      {
        type: 'gate',
        gate: 'H',
        qubits: [0, 1, 2],
        explanation: 'Initialize counting qubits',
        description: 'Create superposition in counting register.',
        math: 'H⊗3|000⟩ = superposition of all counting states'
      },
      {
        type: 'gate',
        gate: 'T',
        qubits: [3],
        explanation: 'Initialize eigenstate (example)',
        description: 'Prepare eigenstate of the unitary operator.',
        math: '|ψ⟩ such that U|ψ⟩ = e^{2πiφ}|ψ⟩'
      },
      {
        type: 'oracle',
        gate: 'CU',
        qubits: [0, 3],
        explanation: 'Controlled-U^1',
        description: 'Apply controlled unitary with power 1.',
        math: 'CU¹: adds phase 2πφ if control is |1⟩'
      },
      {
        type: 'oracle',
        gate: 'CU²',
        qubits: [1, 3],
        explanation: 'Controlled-U^2',
        description: 'Apply controlled unitary with power 2.',
        math: 'CU²: adds phase 4πφ if control is |1⟩'
      },
      {
        type: 'oracle',
        gate: 'CU⁴',
        qubits: [2, 3],
        explanation: 'Controlled-U^4',
        description: 'Apply controlled unitary with power 4.',
        math: 'CU⁴: adds phase 8πφ if control is |1⟩'
      },
      {
        type: 'gate',
        gate: 'QFT†',
        qubits: [0, 1, 2],
        explanation: 'Inverse QFT on counting register',
        description: 'Extract phase information from frequency domain.',
        math: 'QFT† converts phases to computational basis'
      },
      {
        type: 'measure',
        qubits: [0, 1, 2],
        explanation: 'Measure phase estimate',
        description: 'Result gives binary approximation of phase φ.',
        math: 'Measured value ≈ 2ⁿφ (mod 2ⁿ) where n = 3'
      }
    ],
    initialState: '|000⟩|ψ⟩',
    targetState: 'Binary approximation of φ',
    successMetric: 'Accurate phase estimation',
    tips: [
      'More counting qubits give exponentially better precision',
      'Essential for Shor\'s algorithm and quantum simulation',
      'Works for any unitary with known eigenstate'
    ]
  }
};

// Algorithm categories and metadata
export const AlgorithmCategories = {
  basics: {
    name: 'Basic Gates',
    description: 'Fundamental quantum gates and operations',
    color: '#10b981',
    algorithms: ['single-qubit', 'two-qubit', 'bell-states']
  },
  algorithms: {
    name: 'Quantum Algorithms',
    description: 'Complete quantum algorithms showing advantage',
    color: '#6366f1',
    algorithms: ['deutsch', 'grovers', 'qft']
  },
  protocols: {
    name: 'Quantum Protocols',
    description: 'Quantum communication and information protocols',
    color: '#ec4899',
    algorithms: ['teleportation', 'superdense-coding']
  },
  subroutines: {
    name: 'Algorithm Subroutines',
    description: 'Building blocks for larger algorithms',
    color: '#f59e0b',
    algorithms: ['phase-estimation']
  }
};

// Difficulty levels
export const DifficultyLevels = {
  beginner: {
    name: 'Beginner',
    description: 'Introduction to quantum concepts',
    color: '#10b981',
    prerequisites: []
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Basic quantum mechanics understanding required',
    color: '#f59e0b',
    prerequisites: ['single-qubit', 'two-qubit']
  },
  advanced: {
    name: 'Advanced',
    description: 'Solid quantum computing background needed',
    color: '#ef4444',
    prerequisites: ['bell-states', 'deutsch']
  },
  expert: {
    name: 'Expert',
    description: 'Deep quantum algorithm knowledge required',
    color: '#8b5cf6',
    prerequisites: ['grovers', 'qft']
  }
};

// Learning paths
export const LearningPaths = {
  foundations: {
    name: 'Quantum Foundations',
    description: 'Build understanding from basic concepts',
    algorithms: ['single-qubit', 'two-qubit', 'bell-states', 'deutsch'],
    estimatedTime: '2-3 hours'
  },
  algorithms: {
    name: 'Quantum Algorithms',
    description: 'Explore powerful quantum algorithms',
    algorithms: ['deutsch', 'grovers', 'qft', 'phase-estimation'],
    estimatedTime: '3-4 hours'
  },
  protocols: {
    name: 'Quantum Information',
    description: 'Quantum communication protocols',
    algorithms: ['bell-states', 'teleportation', 'superdense-coding'],
    estimatedTime: '2-3 hours'
  },
  complete: {
    name: 'Complete Journey',
    description: 'Full quantum computing curriculum',
    algorithms: Object.keys(AlgorithmDefinitions),
    estimatedTime: '6-8 hours'
  }
};

// Utility functions
export class AlgorithmUtils {
  static getAlgorithm(name) {
    return AlgorithmDefinitions[name];
  }

  static getAlgorithmsByCategory(category) {
    return Object.entries(AlgorithmDefinitions)
      .filter(([_, alg]) => alg.category === category)
      .map(([name, _]) => name);
  }

  static getAlgorithmsByDifficulty(difficulty) {
    return Object.entries(AlgorithmDefinitions)
      .filter(([_, alg]) => alg.difficulty === difficulty)
      .map(([name, _]) => name);
  }

  static getPrerequisites(algorithmName) {
    const algorithm = AlgorithmDefinitions[algorithmName];
    if (!algorithm) return [];
    
    const difficulty = algorithm.difficulty;
    return DifficultyLevels[difficulty]?.prerequisites || [];
  }

  static validatePrerequisites(algorithmName, completedAlgorithms) {
    const prerequisites = this.getPrerequisites(algorithmName);
    return prerequisites.every(prereq => completedAlgorithms.includes(prereq));
  }

  static getNextAlgorithms(currentAlgorithm, completedAlgorithms) {
    const current = AlgorithmDefinitions[currentAlgorithm];
    if (!current) return [];

    // Find algorithms that this one unlocks
    return Object.entries(AlgorithmDefinitions)
      .filter(([name, alg]) => {
        if (completedAlgorithms.includes(name)) return false;
        const prereqs = this.getPrerequisites(name);
        return prereqs.includes(currentAlgorithm) && 
               this.validatePrerequisites(name, [...completedAlgorithms, currentAlgorithm]);
      })
      .map(([name, _]) => name);
  }

  static getEstimatedTime(algorithmName) {
    const algorithm = AlgorithmDefinitions[algorithmName];
    if (!algorithm) return 0;

    const baseTime = {
      beginner: 20,    // 20 minutes
      intermediate: 25, // 25 minutes  
      advanced: 35,    // 35 minutes
      expert: 45      // 45 minutes
    };

    return baseTime[algorithm.difficulty] || 30;
  }

  static getAlgorithmStats() {
    const algorithms = Object.values(AlgorithmDefinitions);
    
    return {
      total: algorithms.length,
      byDifficulty: {
        beginner: algorithms.filter(a => a.difficulty === 'beginner').length,
        intermediate: algorithms.filter(a => a.difficulty === 'intermediate').length,
        advanced: algorithms.filter(a => a.difficulty === 'advanced').length,
        expert: algorithms.filter(a => a.difficulty === 'expert').length
      },
      byCategory: Object.entries(AlgorithmCategories).reduce((acc, [cat, info]) => {
        acc[cat] = info.algorithms.length;
        return acc;
      }, {}),
      totalConcepts: [...new Set(algorithms.flatMap(a => a.concepts))].length,
      averageSteps: Math.round(algorithms.reduce((sum, a) => sum + a.steps.length, 0) / algorithms.length)
    };
  }

  static searchAlgorithms(query) {
    const searchTerm = query.toLowerCase();
    
    return Object.entries(AlgorithmDefinitions)
      .filter(([name, alg]) => {
        return name.toLowerCase().includes(searchTerm) ||
               alg.name.toLowerCase().includes(searchTerm) ||
               alg.description.toLowerCase().includes(searchTerm) ||
               alg.concepts.some(concept => concept.toLowerCase().includes(searchTerm));
      })
      .map(([name, _]) => name);
  }

  static getRandomAlgorithm(difficulty = null, category = null) {
    let candidates = Object.keys(AlgorithmDefinitions);
    
    if (difficulty) {
      candidates = candidates.filter(name => 
        AlgorithmDefinitions[name].difficulty === difficulty);
    }
    
    if (category) {
      candidates = candidates.filter(name => 
        AlgorithmDefinitions[name].category === category);
    }
    
    if (candidates.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
}