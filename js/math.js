/**
 * Math Problem Generator
 * Scales difficulty by level
 */
class MathGenerator {
  /**
   * Generate a math problem based on difficulty level
   * @param {number} level - Current game level (1-5+)
   * @returns {{ question: string, answer: number, choices: number[] }}
   */
  static generate(level) {
    let a, b, op, answer, question;

    switch (true) {
      case level <= 1: // Addition (single digit)
        a = Phaser.Math.Between(1, 9);
        b = Phaser.Math.Between(1, 9);
        answer = a + b;
        question = `${a} + ${b}`;
        break;

      case level === 2: // Subtraction (no negatives)
        a = Phaser.Math.Between(5, 18);
        b = Phaser.Math.Between(1, a);
        answer = a - b;
        question = `${a} - ${b}`;
        break;

      case level === 3: // Multiplication (small)
        a = Phaser.Math.Between(2, 9);
        b = Phaser.Math.Between(2, 9);
        answer = a * b;
        question = `${a} × ${b}`;
        break;

      case level === 4: // Division (clean results)
        b = Phaser.Math.Between(2, 9);
        answer = Phaser.Math.Between(2, 9);
        a = b * answer;
        question = `${a} ÷ ${b}`;
        break;

      default: // Level 5+: Mixed, bigger numbers
        const ops = ['+', '-', '×', '÷'];
        op = Phaser.Math.RND.pick(ops);
        if (op === '+') {
          a = Phaser.Math.Between(10, 50);
          b = Phaser.Math.Between(10, 50);
          answer = a + b;
          question = `${a} + ${b}`;
        } else if (op === '-') {
          a = Phaser.Math.Between(20, 99);
          b = Phaser.Math.Between(1, a);
          answer = a - b;
          question = `${a} - ${b}`;
        } else if (op === '×') {
          a = Phaser.Math.Between(3, 12);
          b = Phaser.Math.Between(3, 12);
          answer = a * b;
          question = `${a} × ${b}`;
        } else {
          b = Phaser.Math.Between(2, 12);
          answer = Phaser.Math.Between(2, 12);
          a = b * answer;
          question = `${a} ÷ ${b}`;
        }
        break;
    }

    // Generate multiple choice options
    const choices = MathGenerator.generateChoices(answer);

    return { question, answer, choices };
  }

  /**
   * Generate 4 multiple choice options including the correct answer
   */
  static generateChoices(correct) {
    const choices = new Set([correct]);
    const range = Math.max(5, Math.floor(correct * 0.5));

    while (choices.size < 4) {
      let wrong = correct + Phaser.Math.Between(-range, range);
      if (wrong < 0) wrong = Math.abs(wrong) + 1;
      if (wrong !== correct) choices.add(wrong);
    }

    // Shuffle
    return Phaser.Utils.Array.Shuffle([...choices]);
  }
}

// Make available globally
window.MathGenerator = MathGenerator;
