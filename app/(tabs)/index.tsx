import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image as RNImage, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

const hero = require("../../assets/images/home-page.png");

export default function HomeTab() {
  const quickActions = [
    {
      title: 'Find Events',
      icon: 'search-outline',
      color: '#4CAF50',
      href: '/(tabs)/explore',
    },
    {
      title: 'Create Event',
      icon: 'add-circle-outline',
      color: '#2196F3',
      href: '/(tabs)/planning',
    },
    {
      title: 'My Profile',
      icon: 'person-outline',
      color: '#FF9800',
      href: '/(tabs)/profile',
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Weekend Hiking Adventure',
      date: 'Jan 15, 2024',
      time: '8:00 AM',
      location: 'Mountain Trail',
      participants: 8,
      maxParticipants: 12,
    },
    {
      id: 2,
      title: 'Coffee & Networking',
      date: 'Jan 18, 2024',
      time: '2:00 PM',
      location: 'Downtown Cafe',
      participants: 5,
      maxParticipants: 10,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <RNImage source={hero} style={styles.heroImage} />
          <ThemedText type="title" style={styles.heroTitle}>
            Welcome to Go2gether
          </ThemedText>
          <ThemedText type="default" style={styles.heroSubtitle}>
            Connect with amazing people and create unforgettable experiences together
          </ThemedText>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href} asChild>
                <TouchableOpacity style={[styles.actionCard, { borderLeftColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                  <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                    {action.title}
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Upcoming Events
          </ThemedText>
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
                  {event.title}
                </ThemedText>
                <ThemedText type="default" style={styles.eventDate}>
                  {event.date}
                </ThemedText>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <ThemedText type="default" style={styles.eventDetailText}>
                    {event.time}
                  </ThemedText>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <ThemedText type="default" style={styles.eventDetailText}>
                    {event.location}
                  </ThemedText>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <ThemedText type="default" style={styles.eventDetailText}>
                    {event.participants}/{event.maxParticipants} participants
                  </ThemedText>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(event.participants / event.maxParticipants) * 100}%`,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <ThemedText type="subtitle" style={styles.ctaTitle}>
            Ready to Get Started?
          </ThemedText>
          <ThemedText type="default" style={styles.ctaSubtitle}>
            Join our community and start discovering amazing events near you
          </ThemedText>
          <Link href="/(tabs)/explore" asChild>
            <TouchableOpacity style={styles.ctaButton}>
              <ThemedText type="defaultSemiBold" style={styles.ctaButtonText}>
                Explore Events
              </ThemedText>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </Link>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  heroImage: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionTitle: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
  },
  eventDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  ctaSection: {
    backgroundColor: '#2196F3',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});


