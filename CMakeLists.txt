cmake_minimum_required(VERSION 3.16...3.26)

include("${CMAKE_CURRENT_SOURCE_DIR}/cmake/common/bootstrap.cmake" NO_POLICY_SCOPE)

project(${_name} VERSION ${_version})

option(ENABLE_FRONTEND_API "Use obs-frontend-api for UI functionality" OFF)
option(ENABLE_QT "Use Qt functionality" OFF)

include(compilerconfig)
include(defaults)
include(helpers)

add_library(${CMAKE_PROJECT_NAME} MODULE)
set_property(TARGET ${CMAKE_PROJECT_NAME} PROPERTY MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
set_property(TARGET plugin-support PROPERTY MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")

find_package(libobs REQUIRED)
target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE OBS::libobs)

if(ENABLE_FRONTEND_API)
  find_package(obs-frontend-api REQUIRED)
  target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE OBS::obs-frontend-api)
endif()

if(ENABLE_QT)
  find_package(Qt6 COMPONENTS Widgets Core)
  target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE Qt6::Core Qt6::Widgets)
  target_compile_options(
    ${CMAKE_PROJECT_NAME} PRIVATE $<$<C_COMPILER_ID:Clang,AppleClang>:-Wno-quoted-include-in-framework-header
                                  -Wno-comma>)
  set_target_properties(
    ${CMAKE_PROJECT_NAME}
    PROPERTIES AUTOMOC ON
               AUTOUIC ON
               AUTORCC ON)
endif()

if(OS_LINUX)
  set(TRIPLET x64-linux)
elseif(OS_MACOS)
  set(TRIPLET universal-osx)
elseif(OS_WINDOWS)
  set(TRIPLET x64-windows-static)
endif()

if(APPLE)
  add_subdirectory(src/SpeechSynthesis/AVFoundationSpeechSynthesis)
  target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE AVFoundationSpeechSynthesis)
endif()

set(unofficial-brotli_DIR ${CMAKE_SOURCE_DIR}/vcpkg_installed/${TRIPLET}/share/unofficial-brotli)
find_package(httplib CONFIG REQUIRED HINTS ${CMAKE_SOURCE_DIR}/vcpkg_installed/${TRIPLET})
target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE httplib::httplib)

target_sources(
  ${CMAKE_PROJECT_NAME}
  PRIVATE src/SpeechSynthesis/SpeechSynthesis.hpp
          src/SpeechSynthesis/SpeechSynthesisEngine.hpp
          src/chattalker-info.c
          src/chattalker.cpp
          src/chattalker.h
          src/ChatTalkerContext.hpp
          src/ChatTalkerContext.cpp
          src/plugin-main.c
          src/TwitchOauthClient.cpp
          src/TwitchOauthClient.hpp)

set_target_properties_plugin(${CMAKE_PROJECT_NAME} PROPERTIES OUTPUT_NAME ${_name})
