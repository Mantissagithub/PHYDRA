add_subdirectory(tests)

enable_testing()

find_package(GTest REQUIRED)
include_directories(${GTEST_INCLUDE_DIRS})

add_executable(runTests count_implementation_test.cpp)
target_link_libraries(runTests ${GTEST_LIBRARIES} pthread)

add_test(NAME CountImplementationTest COMMAND runTests)