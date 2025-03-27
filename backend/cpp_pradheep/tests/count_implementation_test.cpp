const { TestSuite, TestCase } = require('gtest');

TEST(TestSuite, CountImplementation) {
    EXPECT_EQ(1 + 1, 2);
    EXPECT_EQ(2 * 2, 4);
}