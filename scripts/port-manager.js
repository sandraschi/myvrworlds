#!/usr/bin/env node

/**
 * Port Manager for Sandraschi Web Applications
 *
 * Manages port assignments to prevent conflicts between multiple webapps.
 * All ports must be above 11000 to avoid system port conflicts.
 *
 * Usage:
 *   node scripts/port-manager.js check [port]     - Check if port is available
 *   node scripts/port-manager.js list             - List all assigned ports
 *   node scripts/port-manager.js assign [app]     - Assign next available port to app
 *   node scripts/port-manager.js validate         - Validate all port assignments
 */

const fs = require('fs')
const path = require('path')

const PORTS_CONFIG = path.join(__dirname, '..', 'config', 'ports.json')

class PortManager {
  constructor() {
    this.config = this.loadConfig()
  }

  loadConfig() {
    try {
      const data = fs.readFileSync(PORTS_CONFIG, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error loading ports config:', error.message)
      process.exit(1)
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(PORTS_CONFIG, JSON.stringify(this.config, null, 2))
      console.log('✅ Ports configuration saved')
    } catch (error) {
      console.error('Error saving ports config:', error.message)
      process.exit(1)
    }
  }

  checkPort(port) {
    const portNum = parseInt(port)

    // Check range
    if (portNum < this.config.port_range.min) {
      return { available: false, reason: `Port ${portNum} is below minimum ${this.config.port_range.min}` }
    }

    if (portNum > this.config.port_range.max) {
      return { available: false, reason: `Port ${portNum} is above maximum ${this.config.port_range.max}` }
    }

    // Check reserved
    if (this.config.port_range.reserved.includes(portNum)) {
      return { available: false, reason: `Port ${portNum} is reserved for system services` }
    }

    // Check assigned
    const assignedPorts = Object.values(this.config.applications).map(app => app.port)
    if (assignedPorts.includes(portNum)) {
      const app = Object.entries(this.config.applications).find(([_, app]) => app.port === portNum)
      return { available: false, reason: `Port ${portNum} is assigned to ${app ? app[0] : 'unknown application'}` }
    }

    return { available: true, reason: `Port ${portNum} is available` }
  }

  listPorts() {
    console.log('🚀 Sandraschi Web Application Ports\n')
    console.log(`Port Range: ${this.config.port_range.min} - ${this.config.port_range.max}`)
    console.log(`Reserved Ports: ${this.config.port_range.reserved.join(', ')}\n`)

    console.log('📋 Assigned Ports:')
    console.log('─'.repeat(80))

    const categories = {}
    Object.entries(this.config.applications).forEach(([key, app]) => {
      if (!categories[app.category]) {
        categories[app.category] = []
      }
      categories[app.category].push({ key, ...app })
    })

    Object.entries(categories).forEach(([category, apps]) => {
      console.log(`\n🎯 ${category.toUpperCase()}:`)
      apps.forEach(app => {
        const status = app.status === 'active' ? '🟢' : app.status === 'planned' ? '🟡' : '🔴'
        console.log(`  ${status} ${app.port.toString().padEnd(6)} ${app.name.padEnd(25)} ${app.description}`)
      })
    })

    console.log('\n─'.repeat(80))
    const assignedCount = Object.keys(this.config.applications).length
    const totalRange = this.config.port_range.max - this.config.port_range.min + 1
    const availableCount = totalRange - assignedCount - this.config.port_range.reserved.length
    console.log(`📊 Summary: ${assignedCount} assigned, ${availableCount} available ports`)
  }

  assignPort(appName) {
    // Find next available port
    let port = this.config.port_range.min
    while (port <= this.config.port_range.max) {
      if (!this.config.port_range.reserved.includes(port)) {
        const assignedPorts = Object.values(this.config.applications).map(app => app.port)
        if (!assignedPorts.includes(port)) {
          break
        }
      }
      port++
    }

    if (port > this.config.port_range.max) {
      console.error('❌ No available ports in range')
      process.exit(1)
    }

    // Add to config
    this.config.applications[appName] = {
      name: appName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `${appName} web application`,
      port: port,
      category: 'development',
      status: 'planned',
      technologies: ['React', 'TypeScript'],
      dependencies: []
    }

    this.saveConfig()
    console.log(`✅ Assigned port ${port} to ${appName}`)
    return port
  }

  validatePorts() {
    console.log('🔍 Validating port assignments...\n')

    let errors = []
    let warnings = []

    // Check for conflicts
    const ports = new Map()
    Object.entries(this.config.applications).forEach(([appName, app]) => {
      if (ports.has(app.port)) {
        errors.push(`Port conflict: ${app.port} assigned to both ${appName} and ${ports.get(app.port)}`)
      } else {
        ports.set(app.port, appName)
      }
    })

    // Check range and reserved
    Object.entries(this.config.applications).forEach(([appName, app]) => {
      if (app.port < this.config.port_range.min || app.port > this.config.port_range.max) {
        errors.push(`Port ${app.port} for ${appName} is outside valid range`)
      }

      if (this.config.port_range.reserved.includes(app.port)) {
        errors.push(`Port ${app.port} for ${appName} is reserved`)
      }
    })

    // Report results
    if (errors.length === 0) {
      console.log('✅ All port assignments are valid!')
      if (warnings.length > 0) {
        console.log('\n⚠️ Warnings:')
        warnings.forEach(warning => console.log(`  - ${warning}`))
      }
    } else {
      console.log('❌ Port validation failed:')
      errors.forEach(error => console.log(`  - ${error}`))
      process.exit(1)
    }
  }

  updateAppConfig(appName, updates) {
    if (!this.config.applications[appName]) {
      console.error(`❌ Application ${appName} not found`)
      process.exit(1)
    }

    Object.assign(this.config.applications[appName], updates)
    this.saveConfig()
    console.log(`✅ Updated ${appName} configuration`)
  }
}

// CLI Interface
const [,, command, ...args] = process.argv

const manager = new PortManager()

switch (command) {
  case 'check':
    if (!args[0]) {
      console.log('Usage: node scripts/port-manager.js check <port>')
      process.exit(1)
    }
    const result = manager.checkPort(args[0])
    console.log(result.available ? '✅' : '❌', result.reason)
    break

  case 'list':
    manager.listPorts()
    break

  case 'assign':
    if (!args[0]) {
      console.log('Usage: node scripts/port-manager.js assign <app-name>')
      process.exit(1)
    }
    manager.assignPort(args[0])
    break

  case 'validate':
    manager.validatePorts()
    break

  case 'update':
    if (args.length < 3) {
      console.log('Usage: node scripts/port-manager.js update <app-name> <key> <value>')
      process.exit(1)
    }
    const [appName, key, ...valueParts] = args
    const value = valueParts.join(' ')
    manager.updateAppConfig(appName, { [key]: value })
    break

  default:
    console.log('Port Manager for Sandraschi Web Applications\n')
    console.log('Usage:')
    console.log('  node scripts/port-manager.js check <port>     - Check if port is available')
    console.log('  node scripts/port-manager.js list             - List all assigned ports')
    console.log('  node scripts/port-manager.js assign <app>     - Assign next available port to app')
    console.log('  node scripts/port-manager.js validate         - Validate all port assignments')
    console.log('  node scripts/port-manager.js update <app> <key> <value> - Update app config')
    console.log('\nAll ports must be above 11000 to avoid system conflicts.')
    break
}