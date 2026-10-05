describe('CI Failure Barrier Validation', () => {
  it('deliberately fails to verify red CI barrier on pull request', () => {
    // Deliberate test failure for demonstrating Agile CI barrier
    expect('red').toBe('green');
  });
});
