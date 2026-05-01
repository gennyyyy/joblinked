/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import {
  ADMIN_DATA,
  APPLICANTS_DATA,
  APPLICATIONS_DATA,
  DEMO_SESSION_MAP,
  EMPLOYERS_DATA,
  JOBS_DATA,
} from '../mockData'

const AuthContext = createContext(null)

const cloneRecord = (record) => ({ ...record })

const createInitialStore = () => ({
  jobs: JOBS_DATA.map(cloneRecord),
  employers: EMPLOYERS_DATA.map(cloneRecord),
  applicants: APPLICANTS_DATA.map(cloneRecord),
  applications: APPLICATIONS_DATA.map(cloneRecord),
  nextJobId: JOBS_DATA.length + 1,
  nextEmployerId: EMPLOYERS_DATA.length + 1,
  nextApplicantId: APPLICANTS_DATA.length + 1,
  nextApplicationId: APPLICATIONS_DATA.length + 1,
})

function delay(ms = 150) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function sortByDateDesc(items, key) {
  return [...items].sort((left, right) => {
    return new Date(right[key]).getTime() - new Date(left[key]).getTime()
  })
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export function AuthProvider({ children }) {
  const [store, setStore] = useState(() => createInitialStore())
  const [session, setSession] = useState(null)
  const storeRef = useRef(store)

  const commitStore = useCallback((updater) => {
    const nextStore = updater(storeRef.current)
    storeRef.current = nextStore
    setStore(nextStore)
    return nextStore
  }, [])

  const signInAsRole = useCallback((role) => {
    const portalSession = DEMO_SESSION_MAP[role]
    if (!portalSession) {
      return { success: false, error: 'Unknown portal role' }
    }

    setSession(portalSession)
    return { success: true }
  }, [])

  const login = useCallback(async (_email, _password, role) => {
    return signInAsRole(role)
  }, [signInAsRole])

  const logout = useCallback(() => {
    setSession(null)
  }, [])

  const resetMockData = useCallback(() => {
    const nextStore = createInitialStore()
    storeRef.current = nextStore
    setStore(nextStore)
    setSession(null)
  }, [])

  const currentUser = useMemo(() => {
    if (!session) {
      return null
    }

    if (session.role === 'admin') {
      return ADMIN_DATA
    }

    if (session.role === 'applicant') {
      const applicant = store.applicants.find(item => item.id === session.id)
      return applicant || null
    }

    if (session.role === 'employer') {
      const employer = store.employers.find(item => item.id === session.id)
      return employer || null
    }

    return null
  }, [session, store.applicants, store.employers])

  const buildJobRecord = useCallback((job, nextStore = storeRef.current) => {
    const applicationCount = nextStore.applications.filter(app => app.job_id === job.id).length

    return {
      ...job,
      application_count: applicationCount,
    }
  }, [])

  const buildApplicationRecord = useCallback((application, nextStore = storeRef.current) => {
    const job = nextStore.jobs.find(item => item.id === application.job_id)
    const applicant = nextStore.applicants.find(item => item.id === application.user_id)
    const employer = job
      ? nextStore.employers.find(item => item.id === job.employer_id)
      : null

    return {
      ...application,
      title: job?.title || '',
      job_title: job?.title || '',
      company: job?.company || '',
      location: job?.location || '',
      type: job?.type || '',
      category: job?.category || '',
      salary: job?.salary || '',
      description: job?.description || '',
      requirements: job?.requirements || '',
      job_status: job?.status || '',
      full_name: applicant?.full_name || '',
      email: applicant?.email || '',
      phone: applicant?.phone || '',
      barangay: applicant?.barangay || '',
      employer_id: employer?.id || job?.employer_id || null,
      employer_name: employer?.company_name || job?.company || '',
    }
  }, [])

  const api = useMemo(() => ({
    getJobs: async (options = {}) => {
      await delay()
      const { includeInactive = false } = options

      return sortByDateDesc(
        storeRef.current.jobs
          .filter(job => includeInactive || job.status !== 'inactive')
          .map(job => buildJobRecord(job)),
        'created_at',
      )
    },

    getJobsByEmployer: async (employerId) => {
      await delay()

      return sortByDateDesc(
        storeRef.current.jobs
          .filter(job => job.employer_id === employerId)
          .map(job => buildJobRecord(job)),
        'created_at',
      )
    },

    createJob: async (job) => {
      await delay()

      let createdJob = null

      commitStore(previousStore => {
        createdJob = {
          ...job,
          id: previousStore.nextJobId,
          employer_id: job.employerId,
          status: 'active',
          created_at: getToday(),
        }

        return {
          ...previousStore,
          jobs: [createdJob, ...previousStore.jobs],
          nextJobId: previousStore.nextJobId + 1,
        }
      })

      return { success: true, job: buildJobRecord(createdJob) }
    },

    deleteJob: async (id) => {
      await delay()

      commitStore(previousStore => ({
        ...previousStore,
        jobs: previousStore.jobs.filter(job => job.id !== id),
        applications: previousStore.applications.filter(app => app.job_id !== id),
      }))

      return { success: true }
    },

    updateJobStatus: async (id, status) => {
      await delay()

      let updatedJob = null

      commitStore(previousStore => ({
        ...previousStore,
        jobs: previousStore.jobs.map(job => {
          if (job.id !== id) {
            return job
          }

          updatedJob = { ...job, status }
          return updatedJob
        }),
      }))

      return {
        success: true,
        job: updatedJob ? buildJobRecord(updatedJob) : null,
      }
    },

    getApplications: async () => {
      await delay()

      return sortByDateDesc(
        storeRef.current.applications.map(application => buildApplicationRecord(application)),
        'applied_at',
      )
    },

    getApplicationsByUser: async (userId) => {
      await delay()

      return sortByDateDesc(
        storeRef.current.applications
          .filter(application => application.user_id === userId)
          .map(application => buildApplicationRecord(application)),
        'applied_at',
      )
    },

    getApplicationsByJob: async (jobId) => {
      await delay()

      return sortByDateDesc(
        storeRef.current.applications
          .filter(application => application.job_id === jobId)
          .map(application => buildApplicationRecord(application)),
        'applied_at',
      )
    },

    getApplicationsByEmployer: async (employerId) => {
      await delay()

      const employerJobIds = storeRef.current.jobs
        .filter(job => job.employer_id === employerId)
        .map(job => job.id)

      return sortByDateDesc(
        storeRef.current.applications
          .filter(application => employerJobIds.includes(application.job_id))
          .map(application => buildApplicationRecord(application)),
        'applied_at',
      )
    },

    createApplication: async (jobId, userId) => {
      await delay()

      const existingApplication = storeRef.current.applications.find(application => {
        return application.job_id === jobId && application.user_id === userId
      })

      if (existingApplication) {
        return { success: false, error: 'You have already applied for this job' }
      }

      const job = storeRef.current.jobs.find(item => item.id === jobId)
      if (!job || job.status === 'inactive') {
        return { success: false, error: 'This job is no longer accepting applications' }
      }

      let createdApplication = null

      commitStore(previousStore => {
        createdApplication = {
          id: previousStore.nextApplicationId,
          job_id: jobId,
          user_id: userId,
          status: 'pending',
          applied_at: getToday(),
        }

        return {
          ...previousStore,
          applications: [createdApplication, ...previousStore.applications],
          nextApplicationId: previousStore.nextApplicationId + 1,
        }
      })

      return {
        success: true,
        application: buildApplicationRecord(createdApplication),
      }
    },

    updateApplicationStatus: async (id, status) => {
      await delay()

      commitStore(previousStore => ({
        ...previousStore,
        applications: previousStore.applications.map(application => {
          if (application.id !== id) {
            return application
          }

          return { ...application, status }
        }),
      }))

      return { success: true }
    },

    deleteApplication: async (id) => {
      await delay()

      commitStore(previousStore => ({
        ...previousStore,
        applications: previousStore.applications.filter(application => application.id !== id),
      }))

      return { success: true }
    },

    getStats: async () => {
      await delay()

      return {
        userCount: storeRef.current.applicants.length,
        employerCount: storeRef.current.employers.length,
        jobCount: storeRef.current.jobs.length,
        applicationCount: storeRef.current.applications.length,
      }
    },

    getAllUsers: async () => {
      await delay()
      return sortByDateDesc(storeRef.current.applicants.map(cloneRecord), 'created_at')
    },

    getAllEmployers: async () => {
      await delay()
      return sortByDateDesc(storeRef.current.employers.map(cloneRecord), 'created_at')
    },

    updateEmployerStatus: async (id, status) => {
      await delay()

      commitStore(previousStore => ({
        ...previousStore,
        employers: previousStore.employers.map(employer => {
          if (employer.id !== id) {
            return employer
          }

          return { ...employer, status }
        }),
      }))

      return { success: true }
    },
  }), [buildApplicationRecord, buildJobRecord, commitStore])

  const registerApplicant = useCallback(async (formData) => {
    await delay()

    const normalizedEmail = formData.email.trim().toLowerCase()
    const existingApplicant = storeRef.current.applicants.find(applicant => {
      return applicant.email.toLowerCase() === normalizedEmail
    })

    if (existingApplicant) {
      return { success: false, error: 'An applicant account already uses that email' }
    }

    let createdApplicant = null

    commitStore(previousStore => {
      createdApplicant = {
        id: previousStore.nextApplicantId,
        role: 'applicant',
        full_name: formData.fullName.trim(),
        email: normalizedEmail,
        password: formData.password,
        phone: formData.phone.trim(),
        barangay: formData.barangay,
        created_at: getToday(),
      }

      return {
        ...previousStore,
        applicants: [createdApplicant, ...previousStore.applicants],
        nextApplicantId: previousStore.nextApplicantId + 1,
      }
    })

    setSession({ role: 'applicant', id: createdApplicant.id })

    return { success: true, user: createdApplicant }
  }, [commitStore])

  const registerEmployer = useCallback(async (formData) => {
    await delay()

    const normalizedEmail = formData.email.trim().toLowerCase()
    const existingEmployer = storeRef.current.employers.find(employer => {
      return employer.email.toLowerCase() === normalizedEmail
    })

    if (existingEmployer) {
      return { success: false, error: 'An employer account already uses that email' }
    }

    let createdEmployer = null

    commitStore(previousStore => {
      createdEmployer = {
        id: previousStore.nextEmployerId,
        role: 'employer',
        company_name: formData.companyName.trim(),
        email: normalizedEmail,
        password: formData.password,
        address: formData.address.trim(),
        industry: formData.industry,
        contact_person: formData.contactPerson.trim(),
        business_permit: formData.businessPermit.trim(),
        status: 'pending',
        created_at: getToday(),
      }

      return {
        ...previousStore,
        employers: [createdEmployer, ...previousStore.employers],
        nextEmployerId: previousStore.nextEmployerId + 1,
      }
    })

    setSession({ role: 'employer', id: createdEmployer.id })

    return { success: true, employer: createdEmployer }
  }, [commitStore])

  const value = useMemo(() => ({
    api,
    user: currentUser,
    currentUser,
    session,
    dbReady: true,
    login,
    logout,
    resetMockData,
    registerApplicant,
    registerEmployer,
    signInAsRole,
  }), [
    api,
    currentUser,
    login,
    logout,
    registerApplicant,
    registerEmployer,
    resetMockData,
    session,
    signInAsRole,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
