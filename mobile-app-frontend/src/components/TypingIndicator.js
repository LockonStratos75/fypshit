import React from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

const TypingIndicator = () => {
    const dotOpacity = new Animated.Value(0);

    Animated.loop(
        Animated.sequence([
            Animated.timing(dotOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(dotOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            })
        ])
    ).start();

    return (
        <View style={styles.dotsContainer}>
            <Animated.Text style={[styles.dot, { opacity: dotOpacity }]}>.</Animated.Text>
            <Animated.Text style={[styles.dot, { opacity: dotOpacity }]}>.</Animated.Text>
            <Animated.Text style={[styles.dot, { opacity: dotOpacity }]}>.</Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40, // Adjust the width as necessary
    },
    dot: {
        fontSize: 20, // Smaller dot size
        color: '#ffffff', // Ensure dots are always visible but animate opacity
        marginHorizontal: 2, // Adjust spacing between dots
    }
});

export default TypingIndicator;
