/**
 * Math Problem Generator
 * Progressive difficulty: level 1 = small numbers, each level gets harder
 */
class MathGenerator {
  /**
   * @param {number} level - Current game level (1+)
   * @param {string} mathType - 'addition', 'subtraction', 'multiplication', 'division', or 'mixed'
   * @returns {{ question: string, answer: number }}
   */
  static generate(level, mathType) {
    if (mathType === 'mixed') {
      const types = ['addition', 'subtraction', 'multiplication', 'division'];
      mathType = Phaser.Math.RND.pick(types);
    }
    return MathGenerator.generateByType(level, mathType);
  }

  static generateByType(level, type) {
    let a, b, answer, question;

    // Progressive base number: level 1 → 1-2, level 2 → 3-4, level 3 → 5-6, etc.
    const baseLow = (level - 1) * 2 + 1;
    const baseHigh = level * 2;

    if (type === 'addition') {
      a = Phaser.Math.Between(baseLow, baseHigh);
      b = Phaser.Math.Between(1, 10);
      answer = a + b;
      question = `${a} + ${b}`;
    } else if (type === 'subtraction') {
      // Ensure no negative answers
      a = Phaser.Math.Between(baseLow, baseHigh) + 10;
      b = Phaser.Math.Between(1, Math.min(a, 10));
      answer = a - b;
      question = `${a} - ${b}`;
    } else if (type === 'multiplication') {
      a = Phaser.Math.Between(baseLow, baseHigh);
      b = Phaser.Math.Between(1, 10);
      answer = a * b;
      question = `${a} x ${b}`;
    } else if (type === 'division') {
      // Clean division — pick divisor and quotient, then compute dividend
      b = Phaser.Math.Between(baseLow, baseHigh);
      const quotient = Phaser.Math.Between(1, 10);
      a = b * quotient;
      answer = quotient;
      question = `${a} / ${b}`;
    }

    return { question, answer };
  }
}

window.MathGenerator = MathGenerator;
