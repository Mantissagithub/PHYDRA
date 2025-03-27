cmake_minimum_required(VERSION 3.10)
project(cpp_pradheep)

set(CMAKE_CXX_STANDARD 11)

include_directories(${gtest_SOURCE_DIR}/include ${gtest_SOURCE_DIR})

enable_testing()

add_subdirectory(tests)

add_executable(main main.cpp)
target_link_libraries(main gtest gtest_main)